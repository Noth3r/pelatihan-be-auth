import mongoose, { Schema } from "mongoose";

// export type UserType = {
//   email: string;
//   firstName: string;
//   lastName: string;
// } & Document;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  picture: {
    type: String,
    default: "avatar.png",
  },
  password: { type: String, required: true },
});

export default mongoose.model("User", UserSchema);
