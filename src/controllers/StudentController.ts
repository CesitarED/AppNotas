import { Request, Response } from "express";
import { StudentService } from "../services/StudentService";

const studentService = new StudentService();

export const getAllStudents = async (req: Request, res: Response) => {
    try {
        const students = await studentService.getAllStudents();
        res.json(students);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getStudentById = async (req: Request, res: Response) => {
    try {
        const student = await studentService.getStudentById(Number(req.params.id));
        res.json(student);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};

export const createStudent = async (req: Request, res: Response) => {
    try {
        const student = await studentService.createStudent(req.body);
        res.status(201).json(student);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateStudent = async (req: Request, res: Response) => {
    try {
        const student = await studentService.updateStudent(Number(req.params.id), req.body);
        res.json(student);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteStudent = async (req: Request, res: Response) => {
    try {
        const result = await studentService.deleteStudent(Number(req.params.id));
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const assignTeacher = async (req: Request, res: Response) => {
    try {
        const { teacherId } = req.body;
        const student = await studentService.assignTeacher(Number(req.params.id), teacherId);
        res.json({ message: "Profesor asignado correctamente", student });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};