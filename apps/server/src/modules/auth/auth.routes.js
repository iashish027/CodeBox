import { Router } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import {
  signup,
  signin,
  refresh,
  verifyEmail,
  resendVerification,
} from "./auth.controller.js";
import {
  validateSignup,
  validateSignin,
  validateVerifyEmail,
  validateResendVerification,
} from "./auth.validator.js";

const router = Router();

/* 
    1. signin
    2. signup
    3. email verification
*/

router.post("/signup", asyncHandler(validateSignup), asyncHandler(signup));
router.post("/signin", asyncHandler(validateSignin), asyncHandler(signin));
router.post("/refresh", asyncHandler(refresh));
router.get(
  "/verify-email",
  asyncHandler(validateVerifyEmail),
  asyncHandler(verifyEmail),
);
router.post(
  "/resend-verification",
  asyncHandler(validateResendVerification),
  asyncHandler(resendVerification),
);
// router.get("/logout",asyncHandler());

export default router;
