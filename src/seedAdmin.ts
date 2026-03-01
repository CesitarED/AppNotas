import sequelize from "./config/database";
import Administrator from "./models/Administrator";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const seedAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ DB conectada");

        await sequelize.sync({ alter: true });

        const hashedPassword = await bcrypt.hash("admin123", 10);

        await Administrator.findOrCreate({
            where: { email: "admin@appnotas.com" },
            defaults: {
                email: "admin@appnotas.com",
                password: hashedPassword,
                role: "admin"
            }
        });

        console.log("✅ Admin creado:");
        console.log("   Email: admin@appnotas.com");
        console.log("   Password: admin123");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

seedAdmin();