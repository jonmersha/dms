import { Router } from "express";
import { serveGoogleSandbox, handleGoogleCallback } from "../controllers/authController.js";

const router = Router();

router.get("/google-sandbox-simulator", serveGoogleSandbox);
router.get(["/callback", "/callback/"], handleGoogleCallback);

export default router;
