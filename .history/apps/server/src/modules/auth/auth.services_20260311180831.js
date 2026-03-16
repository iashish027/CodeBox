import bcrypt from "bcrypt";
import { ApiError } from "../../shared/errors/apiError.js";
import { ERROR_CODES } from "../../shared/errors/errorCodes.js";
import {prisma} from "@codebox/db/prism"
import { prisma } from "../../../../../packages/db/src/prisma.js";
import { generateAccessToken } from "../../shared/utils/jwt.js";
import {
  generateRefreshToken,
  generateVerificationToken,
  hashToken,
} from "../../shared/utils/token.js";
import { sendVerificationMail } from "../../shared/email/email.service.js";

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
  const verificationToken = generateVerificationToken();
  const hashedVerificationToken = hashToken(verificationToken);

  // Try to create (DB still protects against race condition)
  try {
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        isVerified: false,
        verificationToken: hashedVerificationToken,
        tokenExpiry: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    try {
      console.log("sending");
      await sendVerificationMail(email, username, verificationToken);
      console.log("sent");
    } catch (err) {
      console.error("Email sending failed:", err);
    }

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

  if (!user.isVerified) {
    throw new ApiError(
      403,
      ERROR_CODES.ACCOUNT_NOT_VERIFIED,
      "Account not verified.",
    );
  }

  const token = generateAccessToken({ id: user.id });

  const refreshToken = generateRefreshToken();
  const refreshHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);

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

const refresh = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(
      401,
      ERROR_CODES.INVALID_TOKEN,
      "Refresh token missing.",
    );
  }

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

const verifyEmailService = async (username, token) => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw new ApiError(
      400,
      ERROR_CODES.INVALID_TOKEN,
      "Invalid verification token or user.",
    );
  }

  if (user.isVerified) {
    throw new ApiError(
      400,
      ERROR_CODES.INVALID_TOKEN,
      "Invalid verification token or user.",
    );
  }

  if (!user.verificationToken || !user.tokenExpiry) {
    throw new ApiError(
      400,
      ERROR_CODES.INVALID_TOKEN,
      "Invalid verification token or user.",
    );
  }

  if (user.tokenExpiry < new Date()) {
    throw new ApiError(
      400,
      ERROR_CODES.INVALID_TOKEN,
      "Invalid verification token or user.",
    );
  }

  const hashed = hashToken(token);
  if (hashed !== user.verificationToken) {
    throw new ApiError(
      400,
      ERROR_CODES.INVALID_TOKEN,
      "Invalid verification token or user.",
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null,
      tokenExpiry: new Date(Date.now()),
    },
  });

  return { message: "Email verified successfully." };
};

const resendVerificationService = async ({ email, username }) => {
  const where = email ? { email } : { username };
  const user = await prisma.user.findUnique({ where });

  if (!user || user.isVerified) {
    throw new ApiError(
      400,
      ERROR_CODES.INVALID_TOKEN,
      "Invalid verification token or user.",
    );
  }

  const verificationToken = generateVerificationToken();
  const hashedVerificationToken = hashToken(verificationToken);
  const expiry = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationToken: hashedVerificationToken,
      tokenExpiry: expiry,
    },
  });

  try {
    await sendVerificationMail(user.email, user.username, verificationToken);
  } catch (err) {
    console.error("Resend email failed:", err);
  }

  return { message: "Verification email sent." };
};

export {
  signup,
  signin,
  refresh,
  verifyEmailService,
  resendVerificationService,
};
