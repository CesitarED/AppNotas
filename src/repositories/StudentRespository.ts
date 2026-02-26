import Student from "../models/Student";

export class StudentRepository {
    async findAll() {
        return await Student.findAll();
    }

    async findById(id: number) {
        return await Student.findByPk(id);
    }

    async findByEmail(email: string) {
        return await Student.findOne({ where: { email } });
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