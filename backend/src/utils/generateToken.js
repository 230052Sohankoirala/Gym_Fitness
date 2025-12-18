// utils/jwt.js
import jwt from "jsonwebtoken";

/** Consistent token signer */
export const generateToken = (payload, opts = {}) => {
  const expiresIn = opts.expiresIn || process.env.JWT_EXPIRES || "7d";
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};
