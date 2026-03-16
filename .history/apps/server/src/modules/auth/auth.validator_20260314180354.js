import validator from "validator";
import { ApiError } from "../../shared/errors/apiError.js";
import { ERROR_CODES } from "../../shared/errors/errorCodes.js";

export const validateSignup = (req, res, next) => {
  console.log(req.body);
  const { email, password, username } = req.body;
  if (!email) {
    return next(new ApiError(400, "EMAIL_REQUIRED", "Email required", "USER"));
  }

  if (!password) {
    return next(
      new ApiError(400, "PASSWORD_REQUIRED", "Password required", "USER"),
    );
  }

  if (!username) {
    return next(
      new ApiError(400, "USERNAME_REQUIRED", "Username required", "USER"),
    );
  }

  if (!validator.isEmail(email)) {
    return next(
      new ApiError(
        400,
        ERROR_CODES.INVALID_INPUT,
        "Invalid email format",
        "USER",
      ),
    );
  }

  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    return next(
      new ApiError(
        400,
        ERROR_CODES.WEAK_PASSWORD,
        "Password must contain uppercase, lowercase, number and symbol and should be of minimum length 8",
        "USER",
      ),
    );
  }

  if (!username) {
    return next(
      new ApiError(400, ERROR_CODES.INVALID_INPUT, "Username required", "USER"),
    );
  }

  next();
};

export const validateSignin = (req, res, next) => {
  const { email, username, password } = req.body;

  if (!email && !username) {
    return next(
      new ApiError(
        400,
        ERROR_CODES.INVALID_INPUT,
        "Email or username required",
        "USER",
      ),
    );
  }

  if (!password) {
    return next(
      new ApiError(400, "PASSWORD_REQUIRED", "Password required", "USER"),
    );
  }

  next();
};

export const validateVerifyEmail = (req, res, next) => {
  const { username, token } = req.query;

  if (!username || !token) {
    return next(
      new ApiError(
        400,
        ERROR_CODES.INVALID_INPUT,
        "Username and token are required",
        "USER",
      ),
    );
  }

  next();
};

export const validateResendVerification = (req, res, next) => {
  const { email, username } = req.body;

  if (!email && !username) {
    return next(
      new ApiError(
        400,
        ERROR_CODES.INVALID_INPUT,
        "Email or username required",
        "USER",
      ),
    );
  }

  next();
};
