import { Router } from "express";
import {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    assignSubject,
} from "../controllers/StudentController";
import { authenticateToken, authorizeRole } from "../middleware/auth";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// GET /students - Solo admin puede listar todos los estudiantes
router.get("/", authorizeRole("admin"), getAllStudents);

// GET /students/:id - Admin o el propio estudiante puede ver su perfil
router.get("/:id", getStudentById);

// POST /students - Solo admin puede crear estudiantes
router.post("/", authorizeRole("admin"), createStudent);

// PUT /students/:id - Solo admin puede actualizar estudiantes
router.put("/:id", authorizeRole("admin"), updateStudent);

// DELETE /students/:id - Solo admin puede eliminar estudiantes
router.delete("/:id", authorizeRole("admin"), deleteStudent);

// POST /students/:id/subjects - Solo admin puede asignar materias
router.post("/:id/subjects", authorizeRole("admin"), assignSubject);

export default router;
