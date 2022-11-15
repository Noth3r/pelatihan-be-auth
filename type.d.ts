import { Response } from "express";
import { ObjectId } from "mongoose";
import { User } from "./models/User";

export type EmailLogin = {
  email: string;
  password: string;
};

export type GoogleLogin = {
  tokenId: string;
};

export type Decode = {
  email: string;
  name: string;
  sub: string;
};

export type CreateToken = {
  _id: Types.ObjectId;
  name: string;
  email: string;
};

export type SendToken = {
  user: CreateToken;
  statusCode: number;
  res: Response;
  message: string;
};
