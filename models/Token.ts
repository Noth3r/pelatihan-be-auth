import mongoose, { Schema } from "mongoose";

const TokenSchema = new Schema({
  token: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
});

TokenSchema.pre("save", async function (next) {
  const userId = this.token.split("++")[0];
  const Token = mongoose.model("Token", TokenSchema);
  const token = await Token.find({
    token: new RegExp(`/^${userId}/`),
  });
  if (token.length > 100) {
    await Token.deleteOne({ token: token[0].token });
  }

  next();
});

export default mongoose.model("Token", TokenSchema);
