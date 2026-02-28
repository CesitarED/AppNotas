// src/routes/publicRoutes.ts
import { Router, Request, Response } from "express";
import { Teacher } from "../models/Teaching";
import { Subject } from "../models/Teaching";

const router = Router();

// GET /public/directory - Obtiene todos los profesores y sus asignaturas
router.get("/directory", async (req: Request, res: Response) => {
    try {
        const teachers = await Teacher.findAll({
            attributes: ['id', 'name', 'email'],
            include: [{
                model: Subject,
                as: 'subjects',
                attributes: ['id', 'name']
            }]
        });

        // Enviar respuesta exitosa
        res.status(200).json(teachers);
    } catch (error: any) {
        console.error("Error fetching public directory:", error);
        res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
});

export default router;
