import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";

const authService = new AuthService();

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.json(result);
    } catch (error: any) {
        res.status(401).json({ message: error.message });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await authService.register(email, password);
        res.status(201).json({ message: "Administrador creado exitosamente", admin: result });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
