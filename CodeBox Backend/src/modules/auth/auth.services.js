import bcrypt from "bcrypt";
import { ApiError } from "../../shared/errors/apiError.js";
import { ERROR_CODES } from "../../shared/errors/errorCodes.js";
import { prisma } from "../../config/prisma.js";
import { generateAccessToken } from "../../shared/utils/jwt.js";
import crypto from "crypto";

/* 
   1. signup
        . get username, email, password from user
        . hash password
        . check if already exist (then say already exist and return)
        . send verification mail
        . create new entry (or update existing unverified user)
    2. signin
        . check if user exist
        . check if password is same
        . if yes send jwt token
        . if no send error msg
    3. mail
        . check if account with this mail is already verified
        . if verified say already verified.
        . send verification mail.
    
    4. verify-mail
        . check for token with given mail account.
        . verify if valid
    5. referesh
        . check if it is a valid referesh token , with given session_id.
        . rotate referesh token .
        . send referesh token and access_token 
*/

const SALT_ROUNDS = 10;

const signup = async ({ email, username, password }) => {
  // Check email first
  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingEmail) {
    throw new ApiError(
      409,
      ERROR_CODES.EMAIL_EXIST,
      "An account with this email already exists.",
    );
  }

  // Check username only if email is free
  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUsername) {
    throw new ApiError(
      409,
      ERROR_CODES.USERNAME_EXIST,
      "Username is not available.",
    );
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Try to create (DB still protects against race condition)
  try {
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        isVerified: false,
        verificationToken: Math.random().toString(36).substring(2),
      },
    });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      message: "Account created successfully.",
    };
  } catch (error) {
    // Concurrency safety fallback
    if (error.code === "P2002") {
      throw new ApiError(
        409,
        ERROR_CODES.CONFLICT,
        "Unable to create account. Please try again.",
      );
    }

    throw error;
  }
};

const signin = async ({ email, username, password }) => {
  // determine lookup criteria based on supplied field
  const where = email ? { email } : { username };
  const user = await prisma.user.findFirst({ where });

  if (!user) {
    throw new ApiError(
      401,
      ERROR_CODES.INVALID_CREDENTIALS,
      "Invalid email/username or password.",
    );
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) {
    throw new ApiError(
      401,
      ERROR_CODES.INVALID_CREDENTIALS,
      "Invalid email/username or password.",
    );
  }

  //for now not enabling the account verification , will unable it after implementing verification mail functionality
  // if (!user.isVerified) {
  //   throw new ApiError(
  //     403,
  //     ERROR_CODES.ACCOUNT_NOT_VERIFIED,
  //     "Account not verified.",
  //   );
  // }


  // generate access token as before
  const token = generateAccessToken({ id: user.id });

  // create a new session / refresh token pair
  const refreshToken = generateRefreshToken();
  const refreshHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);

  // compute expiration for refresh token; fall back to 7 days if env not set
  const refreshExpiryMs =
    parseInt(process.env.JWT_REFRESH_EXPIRES_IN || "0", 10) ||
    7 * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + refreshExpiryMs);
  
  await prisma.session.create({
    data: {
      userId: user.id,
      refreshHash,
      expiresAt,
      // userAgent / ipAddress will be filled by controller if needed
    },
  });

  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
  };
};

const logout = (req, res) => {
  // nothing implemented yet
};

// helper used by both signin and refresh logic
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString("hex");
};

const refresh = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(
      401,
      ERROR_CODES.INVALID_TOKEN,
      "Refresh token missing.",
    );
  }

  // look up a valid session whose hash matches the provided token
  const now = new Date();
  const sessions = await prisma.session.findMany({
    where: { expiresAt: { gt: now } },
    include: { user: true },
  });

  let session = null;
  for (const s of sessions) {
    const match = await bcrypt.compare(refreshToken, s.refreshHash);
    if (match) {
      session = s;
      break;
    }
  }

  if (!session) {
    throw new ApiError(
      401,
      ERROR_CODES.INVALID_TOKEN,
      "Invalid or expired refresh token.",
    );
  }

  // rotate tokens: issue new access and refresh tokens and update session record
  const token = generateAccessToken({ id: session.userId });
  const newRefreshToken = generateRefreshToken();
  const newHash = await bcrypt.hash(newRefreshToken, SALT_ROUNDS);

  const refreshExpiryMs =
    parseInt(process.env.JWT_REFRESH_EXPIRES_IN || "0", 10) ||
    7 * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + refreshExpiryMs);

  await prisma.session.update({
    where: { id: session.id },
    data: { refreshHash: newHash, expiresAt },
  });

  return {
    token,
    refreshToken: newRefreshToken,
    user: {
      id: session.user.id,
      email: session.user.email,
      username: session.user.username,
    },
  };
};

export { signup, signin, refresh };
