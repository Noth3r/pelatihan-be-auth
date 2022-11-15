import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
dotenv.config();

export default new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "postmessage"
);
