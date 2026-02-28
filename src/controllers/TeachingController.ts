import { Request, Response } from "express";
import { TeachingService } from "../services/TeachingService";

const teachingService = new TeachingService();

// ===== TEACHERS =====
export const getAllTeachers = async (req: Request, res: Response) => {
    try {
        const teachers = await teachingService.getAllTeachers();
        res.json(teachers);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getTeacherById = async (req: Request, res: Response) => {
    try {
        const teacher = await teachingService.getTeacherById(Number(req.params.id));
        res.json(teacher);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};

export const createTeacher = async (req: Request, res: Response) => {
    try {
        const teacher = await teachingService.createTeacher(req.body);
        res.status(201).json(teacher);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateTeacher = async (req: Request, res: Response) => {
    try {
        const teacher = await teachingService.updateTeacher(Number(req.params.id), req.body);
        res.json(teacher);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteTeacher = async (req: Request, res: Response) => {
    try {
        const result = await teachingService.deleteTeacher(Number(req.params.id));
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ===== SUBJECTS =====
export const getSubjectsByTeacher = async (req: Request, res: Response) => {
    try {
        const subjects = await teachingService.getSubjectsByTeacher(Number(req.params.id));
        res.json(subjects);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getSubjectById = async (req: Request, res: Response) => {
    try {
        const subject = await teachingService.getSubjectById(Number(req.params.id));
        res.json(subject);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};

export const createSubject = async (req: Request, res: Response) => {
    try {
        const subject = await teachingService.createSubject(req.body);
        res.status(201).json(subject);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteSubject = async (req: Request, res: Response) => {
    try {
        const result = await teachingService.deleteSubject(Number(req.params.id));
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ===== GRADES =====
export const getGradesBySubject = async (req: Request, res: Response) => {
    try {
        const grades = await teachingService.getGradesBySubject(Number(req.params.id));
        res.json(grades);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getGradesByStudent = async (req: Request, res: Response) => {
    try {
        const grades = await teachingService.getGradesByStudent(Number(req.params.id));
        res.json(grades);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createGrade = async (req: Request, res: Response) => {
    try {
        const grade = await teachingService.createGrade(req.body);
        res.status(201).json(grade);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateGrade = async (req: Request, res: Response) => {
    try {
        const grade = await teachingService.updateGrade(Number(req.params.id), req.body);
        res.json(grade);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteGrade = async (req: Request, res: Response) => {
    try {
        const result = await teachingService.deleteGrade(Number(req.params.id));
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
