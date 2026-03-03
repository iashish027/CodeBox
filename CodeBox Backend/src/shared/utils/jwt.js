import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  const payload = {
    sub: user.id || user._id,
    role: user.role || "user",
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
