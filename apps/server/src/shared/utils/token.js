import crypto from "crypto";
import { createHash } from "crypto";

const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString("hex");
};

const generateVerificationToken = () => {
  return crypto.randomBytes(40).toString("hex");
};

const hashToken = (token) => createHash("sha256").update(token).digest("hex");

export { generateRefreshToken, generateVerificationToken, hashToken };
