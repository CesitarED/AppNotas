import { StudentRepository } from "../repositories/StudentRespository";

export class StudentService {
    private studentRepository: StudentRepository;
    constructor() {
        this.studentRepository = new StudentRepository();
    }
    async getAllStudents() {
        return await this.studentRepository.getAllStudents();
    }
    async getStudentById(id: number) {
        return await this.studentRepository.getStudentById(id);
    }
    async updateStudent(id: number, student: Student) {
        return await this.studentRepository.updateStudent(id, student);
    }
    async deleteStudent(id: number) {
        return await this.studentRepository.deleteStudent(id);
    }
}
