import sequelize from './src/config/database';
import Administrator from './src/models/Administrator';

async function listAdmins() {
    try {
        await sequelize.authenticate();
        console.log("DB connected.");
        const admins = await Administrator.findAll();
        console.log("Administrators in DB:", JSON.stringify(admins, null, 2));
    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit();
    }
}

listAdmins();
