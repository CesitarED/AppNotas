import { Router } from "express";
import { login, register } from "../controllers/AuthController";

const router = Router();

// POST /auth/login - Login para admin y estudiante
router.post("/login", login);

// POST /auth/register - Registro de administrador
router.post("/register", register);

export default router;
