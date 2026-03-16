import { ApiError } from "../errors/apiError.js";

export const errorMiddleware = (err, req, res, next) => {
  // Handle controlled API errors
  if (err instanceof ApiError) {
    // console.log(err);
    return res.status(err.status).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }

  // Log unexpected/system errors
  console.error("Unexpected Error:", err);

  // Do NOT expose internal error details
  return res.status(500).json({
    success: false,
    code: "INTERNAL_ERROR",
    message: "Internal Server Error",
  });
};
