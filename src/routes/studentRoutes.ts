import { Router } from "express";
import {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    assignTeacher,
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

// PUT /students/:id/assign-teacher - Solo admin puede asignar profesor
router.put("/:id/assign-teacher", authorizeRole("admin"), assignTeacher);

export default router;
