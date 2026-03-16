import { sendMail } from "../../config/mailer.js";
import env from "../../config/env.js";
export const sendVerificationMail = async (email, username, token) => {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email?username=${username}&token=${token}`;
  
  const info = await sendMail({
    to: email,
    subject: "Ublog account verification",
    text: `Please verify your account by clicking the following link: ${verificationUrl}`,
  });
 
  if (!info.accepted) {
    throw new Error("Unable to send verification email");
  }

  return info;
};