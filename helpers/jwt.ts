import { CreateToken } from "../type";
import jwt from "jsonwebtoken";

/* Create token */
export const createRefreshToken = ({ _id, name, email }: CreateToken) => {
  return jwt.sign({ _id, name, email }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRED_IN,
  });
};

export const createAccessToken = ({ _id, name, email }: CreateToken) => {
  return jwt.sign({ _id, name, email }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: process.env.JWT_ACCESS_EXPIRED_IN,
  });
};

/* Verify JWT */
export const verifyJwt = (token: string, key: string) => {
  try {
    const decoded = jwt.verify(token, key);
    return { payload: decoded as CreateToken, expired: false };
  } catch (err) {
    return {
      payload: null,
      expired: (err as Error).message.includes("jwt expired"),
    };
  }
};

export const decodeJwt = (token: string) => {
  try {
    return jwt.decode(token);
  } catch (err) {
    return null;
  }
};
