import jwt from "jsonwebtoken";
import { ApiError } from "../errors/apiError.js";


const verifyAccessToken = (req, res, next) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return next(
         new ApiError(
            401,
            "AUTH_INVALID",
            "Access token missing",
            "USER"
         )
      );
  }

  try {

      const decoded = jwt.verify(
         token,
         process.env.JWT_SECRET
      );

      req.user = decoded;
      next();

   } catch (err) {

      return next(
         new ApiError(
            401,
            "AUTH_EXPIRED",
            "Invalid or expired token",
            "USER"
         )
      );

   }
};

export default verifyAccessToken;