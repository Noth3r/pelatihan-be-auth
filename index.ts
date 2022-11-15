import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookie from "cookie-parser";
import authRoutes from "./routes/auth";
import connection from "./helpers/db";

dotenv.config();

connection.once("open", () => console.log("Connected to database"));
connection.once("error", () => console.log("Error connecting to database"));

const app = express();

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);
app.use(cookie());
app.use(express.json());

app.use("/auth", authRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
