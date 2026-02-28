import { StudentRepository } from "../repositories/StudentRespository";
import bcrypt from "bcryptjs";

export class StudentService {
    private studentRepository: StudentRepository;

    constructor() {
        this.studentRepository = new StudentRepository();
    }

    async getAllStudents() {
        return await this.studentRepository.findAll();
    }

    async getStudentById(id: number) {
        const student = await this.studentRepository.findById(id);
        if (!student) {
            throw new Error("Estudiante no encontrado");
        }
        return student;
    }

    async createStudent(data: any) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return await this.studentRepository.createStudent({
            ...data,
            password: hashedPassword,
        });
    }

    async updateStudent(id: number, data: any) {
        // Si se actualiza la contraseña, hashearla
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        return await this.studentRepository.updateStudent(id, data);
    }

    async deleteStudent(id: number) {
        return await this.studentRepository.deleteStudent(id);
    }

    async assignTeacher(studentId: number, teacherId: number) {
        return await this.studentRepository.updateStudent(studentId, { teacherId });
    }
}