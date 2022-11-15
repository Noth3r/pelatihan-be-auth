import bcrypt from "bcrypt";
import User from "../models/User";
import google from "../helpers/google";
import { CreateToken, Decode, EmailLogin, GoogleLogin } from "../type";
import {
  createAccessToken,
  createRefreshToken,
  decodeJwt,
  verifyJwt,
} from "../helpers/jwt";
import Token from "../models/Token";
import { Request, Response } from "express";

type Data = {
  message: string;
};

type ErrorData = {
  error: string;
};

type TypeBody = {
  name: string;
  email: string;
  password: string;
};

export const signUp = async (req: Request, res: Response<Data | ErrorData>) => {
  const { name, email, password } = req.body as TypeBody;

  if (!email || !password)
    return res.status(400).json({ error: "Must provide email and password" });

  let user = await User.findOne({ email });

  if (user) {
    return res.status(400).json({ error: "Email already in use" });
  }

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  user = new User({
    name,
    email,
    password: hash,
  });

  user.save((err) => {
    if (err) {
      return res.status(400).json({ error: "Error saving user to database" });
    }

    res.json({ message: "User created successfully" });
  });
};

export const signIn = async (req: Request, res: Response) => {
  const { email, password, tokenId } = req.body as EmailLogin & GoogleLogin;
  if (tokenId) {
    const { tokens } = await google.getToken(tokenId);
    const decode = decodeJwt(tokens.id_token!) as Decode;
    if (!decode) return res.status(400).json({ error: "Invalid token" });

    const { email, name, sub } = decode;
    let user = await User.findOne({ email });
    if (!user) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(sub, salt);

      user = new User({
        name,
        email,
        password: hash,
      });

      user.save((err, user) => {
        if (err) {
          return res
            .status(400)
            .json({ error: "Error saving user to database" });
        }

        return res.json({ name, email, picture: user.picture });
      });
    } else {
      return sendToken(user as CreateToken, 200, res, {
        email: user.email,
        picture: user.picture,
      });
    }
  } else {
    if (!email || !password)
      return res.status(400).json({ error: "Must provide email and password" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "Invalid email or password" });

    const compare = bcrypt.compareSync(password, user?.password!);

    if (compare)
      sendToken(user as CreateToken, 200, res, {
        email: user.email,
        picture: user.picture,
      });
    else res.status(400).json({ error: "Invalid email or password" });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No token" });

  const { payload } = verifyJwt(token, process.env.JWT_REFRESH_SECRET!);

  if (!payload) return res.status(401).json({ message: "Invalid token" });

  const isActive = await checkRevoke(payload._id + "++" + token);
  if (!isActive) {
    await revokeAllToken(payload._id);
    return res.status(401).json({ message: "Invalid token" });
  } else {
    await Token.findOneAndUpdate(
      { token: payload._id + "++" + token },
      { isActive: false }
    );
  }

  sendToken(payload as CreateToken, 200, res, null);
};

const checkRevoke = async (token: string) => {
  const isActive = await Token.findOne({ token, isActive: true });
  return isActive ? true : false;
};

const revokeAllToken = async (userId: string) => {
  const tokens = await Token.find({ token: new RegExp(`^${userId}`) });
  tokens.forEach((token) => token.remove());
};

const sendToken = async (
  user: CreateToken,
  statusCode: number,
  res: Response,
  message: object | null
) => {
  const refreshToken = createRefreshToken(user);
  const accessToken = createAccessToken(user);

  const token = new Token({ token: user._id + "++" + refreshToken });
  await token.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 60 * 1000 * 60 * 24 * 7,
    secure: true,
    sameSite: "strict",
  });

  return res.status(statusCode).json({
    success: true,
    message: { ...message, token: accessToken },
  });
};
