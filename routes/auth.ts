import { Router } from "express";
import { refreshToken, signIn, signUp } from "../controllers/auth";

const authRoutes = Router();

authRoutes.post("/signup", signUp);
authRoutes.post("/signin", signIn);
authRoutes.get("/refresh", refreshToken);

export default authRoutes;
