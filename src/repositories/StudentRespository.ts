import Student from "../models/Student";
import { Subject, Teacher } from "../models/Teaching";

export class StudentRepository {
    async findAll() {
        return await Student.findAll({ include: [{ model: Subject, as: 'subjects', include: ['teacher'] }] });
    }

    async findById(id: number) {
        return await Student.findByPk(id, { include: [{ model: Subject, as: 'subjects', include: ['teacher'] }] });
    }

    async findByEmail(email: string) {
        return await Student.findOne({ where: { email }, include: [{ model: Subject, as: 'subjects', include: ['teacher'] }] });
    }

    async createStudent(student: any) {
        return await Student.create(student);
    }

    async updateStudent(id: number, student: any) {
        const existingStudent = await this.findById(id);
        if (!existingStudent) {
            throw new Error("Estudiante no encontrado");
        }
        return await existingStudent.update(student);
    }

    async deleteStudent(id: number) {
        const existingStudent = await this.findById(id);
        if (!existingStudent) {
            throw new Error("Estudiante no encontrado");
        }
        await existingStudent.destroy();
        return { message: "Estudiante eliminado correctamente" };
    }
}