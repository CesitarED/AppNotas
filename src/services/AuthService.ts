import { AdministratorRepository } from "../repositories/AdministratorRepository";
import { StudentRepository } from "../repositories/StudentRespository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class AuthService {
    private adminRepository: AdministratorRepository;
    private studentRepository: StudentRepository;

    constructor() {
        this.adminRepository = new AdministratorRepository();
        this.studentRepository = new StudentRepository();
    }

    async login(email: string, password: string) {
        // Buscar primero en administradores
        const admin = await this.adminRepository.findByEmail(email);
        if (admin) {
            const validPassword = await bcrypt.compare(password, admin.password);
            if (!validPassword) {
                throw new Error("Contraseña incorrecta");
            }
            const token = jwt.sign(
                { id: admin.id, role: "admin" },
                process.env.JWT_SECRET as string,
                { expiresIn: "1h" }
            );
            return { token, role: "admin" };
        }

        // Buscar en estudiantes
        const student = await this.studentRepository.findByEmail(email);
        if (student) {
            const validPassword = await bcrypt.compare(password, student.password);
            if (!validPassword) {
                throw new Error("Contraseña incorrecta");
            }
            const token = jwt.sign(
                { id: student.id, role: "student" },
                process.env.JWT_SECRET as string,
                { expiresIn: "1h" }
            );
            return { token, role: "student" };
        }

        throw new Error("Usuario no encontrado");
    }

    async register(email: string, password: string) {
        const existingAdmin = await this.adminRepository.findByEmail(email);
        if (existingAdmin) {
            throw new Error("Administrador ya existe");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = await this.adminRepository.createAdministrator({
            email,
            password: hashedPassword,
        });
        return newAdmin;
    }
}