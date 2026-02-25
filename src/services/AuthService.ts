import { AdministratorRepository } from "../repositories/AdministratorRepository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class AuthService {
    private adminRepository: AdministratorRepository;
    constructor() {
        this.adminRepository = new AdministratorRepository();
    }
    async login(email: string, password: string) {
        const admin = await this.adminRepository.findByEmail(email);
        if (!admin) {
            throw new Error("Administrador no encontrado");
        }
        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) {
            throw new Error("Contraseña incorrecta");
        }
        const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET as string, { expiresIn: "1h" });
        return { token };
    }
    async register(email: string, password: string) {
        const admin = await this.adminRepository.findByEmail(email);
        if (admin) {
            throw new Error("Administrador ya existe");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = await this.adminRepository.createAdministrator({ email, password: hashedPassword });
        return newAdmin;
    }
}