import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/test", (error) => {
  if (error) throw error;
});

export default mongoose.connection;
