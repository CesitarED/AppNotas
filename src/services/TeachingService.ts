import { TeachingRepository } from "../repositories/TeachingRepository";
import bcrypt from "bcryptjs";

export class TeachingService {
    private repo: TeachingRepository;

    constructor() {
        this.repo = new TeachingRepository();
    }

    // ===== TEACHERS =====
    async getAllTeachers() {
        return await this.repo.findAllTeachers();
    }

    async getTeacherById(id: number) {
        const teacher = await this.repo.findTeacherById(id);
        if (!teacher) throw new Error("Profesor no encontrado");
        return teacher;
    }

    async createTeacher(data: any) {
        const existing = await this.repo.findTeacherByEmail(data.email);
        if (existing) throw new Error("Ya existe un profesor con ese correo");
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return await this.repo.createTeacher({
            ...data,
            password: hashedPassword,
        });
    }

    async updateTeacher(id: number, data: any) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        return await this.repo.updateTeacher(id, data);
    }

    async deleteTeacher(id: number) {
        return await this.repo.deleteTeacher(id);
    }

    // ===== SUBJECTS =====
    async getSubjectsByTeacher(teacherId: number) {
        return await this.repo.findSubjectsByTeacher(teacherId);
    }

    async getSubjectById(id: number) {
        const subject = await this.repo.findSubjectById(id);
        if (!subject) throw new Error("Asignatura no encontrada");
        return subject;
    }

    async createSubject(data: any) {
        return await this.repo.createSubject(data);
    }

    async deleteSubject(id: number) {
        return await this.repo.deleteSubject(id);
    }

    // ===== GRADES =====
    async getGradesBySubject(subjectId: number) {
        return await this.repo.findGradesBySubject(subjectId);
    }

    async getGradesByStudent(studentId: number) {
        return await this.repo.findGradesByStudent(studentId);
    }

    async createGrade(data: any) {
        return await this.repo.createGrade(data);
    }

    async updateGrade(id: number, data: any) {
        return await this.repo.updateGrade(id, data);
    }

    async deleteGrade(id: number) {
        return await this.repo.deleteGrade(id);
    }
}
