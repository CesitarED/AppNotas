import Administrator from "../models/Administrator";

export class AdministratorRepository {
    async findByEmail(email: string): Promise<Administrator | null> {
        return await Administrator.findOne({ where: { email } });
    }
    async createAdministrator(admin: any) {
        return await Administrator.create(admin);
    }
}