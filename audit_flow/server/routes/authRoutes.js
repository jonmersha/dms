import { Router } from "express";
import { login, register, getGoogleUrl } from "../controllers/authController.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/google/url", getGoogleUrl);

export default router;
