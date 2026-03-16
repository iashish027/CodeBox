import {
  signup as signupService,
  signin as signinService,
  refresh as refreshService,
  verifyEmailService,
  resendVerificationService,
} from "./auth.services.js";

const signup = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const result = await signupService({ email, username, password });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const signin = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    const result = await signinService({ email, username, password });
    // store refresh token in http-only cookie so JavaScript cannot read it
    // maxAge should roughly match the server-side expiration we calculated earlier
    const refreshExpiry =
      parseInt(process.env.JWT_REFRESH_EXPIRES_IN || "0", 10) ||
      7 * 24 * 60 * 60 * 1000; // fallback 1 week

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: refreshExpiry,
    });

    // don't return refresh token in response body
    res.status(200).json({
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const result = await refreshService(refreshToken);

    // rotate cookie
    const refreshExpiry =
      parseInt(process.env.JWT_REFRESH_EXPIRES_IN || "0", 10) ||
      7 * 24 * 60 * 60 * 1000;

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: refreshExpiry,
    });

    res.status(200).json({
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
};

// verify email controller
const verifyEmail = async (req, res, next) => {
  try {
    const { username, token } = req.query;
    const result = await verifyEmailService(username, token);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// resend verification controller
const resendVerification = async (req, res, next) => {
  try {
    const { email, username } = req.body;
    const result = await resendVerificationService({ email, username });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export { signup, signin, refresh, verifyEmail, resendVerification };
