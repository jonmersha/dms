import { Router } from "express";
import { getUsers, saveUsers } from "../controllers/userController.js";

const router = Router();

router.get("/", getUsers);
router.post("/", saveUsers);

export default router;
