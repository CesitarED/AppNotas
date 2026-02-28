import { Teacher, Subject, Grade } from "../models/Teaching";
import Student from "../models/Student";

export class TeachingRepository {
    // ===== TEACHERS =====
    async findAllTeachers() {
        return await Teacher.findAll({
            attributes: { exclude: ['password'] },
            include: [{ model: Subject, as: 'subjects' }]
        });
    }

    async findTeacherById(id: number) {
        return await Teacher.findByPk(id, {
            include: [{ model: Subject, as: 'subjects' }]
        });
    }

    async findTeacherByEmail(email: string) {
        return await Teacher.findOne({ where: { email } });
    }

    async createTeacher(data: any) {
        return await Teacher.create(data);
    }

    async updateTeacher(id: number, data: any) {
        const teacher = await Teacher.findByPk(id);
        if (!teacher) throw new Error("Profesor no encontrado");
        return await teacher.update(data);
    }

    async deleteTeacher(id: number) {
        const teacher = await Teacher.findByPk(id);
        if (!teacher) throw new Error("Profesor no encontrado");
        await teacher.destroy();
        return { message: "Profesor eliminado correctamente" };
    }

    async findSubjectsByTeacher(teacherId: number) {
        return await Subject.findAll({
            where: { teacherId },
            include: [
                { model: Grade, as: 'grades', include: [{ model: Student, as: 'student', attributes: ['id', 'name', 'email'] }] },
                { model: Student, as: 'students', attributes: ['id', 'name', 'email'] }
            ]
        });
    }

    async findSubjectById(id: number) {
        return await Subject.findByPk(id, {
            include: [
                { model: Teacher, as: 'teacher', attributes: ['id', 'name'] },
                { model: Grade, as: 'grades', include: [{ model: Student, as: 'student', attributes: ['id', 'name', 'email'] }] }
            ]
        });
    }

    async createSubject(data: any) {
        return await Subject.create(data);
    }

    async deleteSubject(id: number) {
        const subject = await Subject.findByPk(id);
        if (!subject) throw new Error("Asignatura no encontrada");
        await subject.destroy();
        return { message: "Asignatura eliminada correctamente" };
    }

    // ===== GRADES =====
    async findGradesBySubject(subjectId: number) {
        return await Grade.findAll({
            where: { subjectId },
            include: [{ model: Student, as: 'student', attributes: ['id', 'name', 'email'] }],
            order: [['date', 'DESC']]
        });
    }

    async findGradesByStudent(studentId: number) {
        return await Grade.findAll({
            where: { studentId },
            include: [{
                model: Subject, as: 'subject',
                include: [{ model: Teacher, as: 'teacher', attributes: ['id', 'name'] }]
            }],
            order: [['date', 'DESC']]
        });
    }

    async createGrade(data: any) {
        return await Grade.create(data);
    }

    async updateGrade(id: number, data: any) {
        const grade = await Grade.findByPk(id);
        if (!grade) throw new Error("Nota no encontrada");
        return await grade.update(data);
    }

    async deleteGrade(id: number) {
        const grade = await Grade.findByPk(id);
        if (!grade) throw new Error("Nota no encontrada");
        await grade.destroy();
        return { message: "Nota eliminada correctamente" };
    }
}
