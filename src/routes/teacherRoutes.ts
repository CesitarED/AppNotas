import { Router } from "express";
import {
    getAllTeachers,
    getTeacherById,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    getSubjectsByTeacher,
    getSubjectById,
    createSubject,
    deleteSubject,
    getGradesBySubject,
    getGradesByStudent,
    createGrade,
    updateGrade,
    deleteGrade,
} from "../controllers/TeachingController";
import { authenticateToken, authorizeRole } from "../middleware/auth";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// ===== TEACHERS (Solo admin) =====
router.get("/", authorizeRole("admin"), getAllTeachers);
router.get("/:id", authorizeRole("admin", "teacher"), getTeacherById);
router.post("/", authorizeRole("admin"), createTeacher);
router.put("/:id", authorizeRole("admin"), updateTeacher);
router.delete("/:id", authorizeRole("admin"), deleteTeacher);

// ===== SUBJECTS =====
// Obtener asignaturas de un profesor (admin y teacher)
router.get("/:id/subjects", authorizeRole("admin", "teacher"), getSubjectsByTeacher);
// Obtener detalle de una asignatura
router.get("/subjects/:id", authorizeRole("admin", "teacher"), getSubjectById);
// Crear asignatura para un profesor (admin)
router.post("/subjects", authorizeRole("admin"), createSubject);
// Eliminar asignatura (admin)
router.delete("/subjects/:id", authorizeRole("admin"), deleteSubject);

// ===== GRADES =====
// Obtener notas por asignatura (teacher y admin)
router.get("/subjects/:id/grades", authorizeRole("admin", "teacher"), getGradesBySubject);
// Obtener notas de un estudiante (student, teacher, admin)
router.get("/grades/student/:id", authorizeRole("admin", "teacher", "student"), getGradesByStudent);
// Crear nota (teacher)
router.post("/grades", authorizeRole("teacher"), createGrade);
// Actualizar nota (teacher)
router.put("/grades/:id", authorizeRole("teacher"), updateGrade);
// Eliminar nota (teacher)
router.delete("/grades/:id", authorizeRole("teacher"), deleteGrade);

export default router;
