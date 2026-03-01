import express from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import sequelize from "./config/database";
import authRoutes from "./routes/authRoutes";
import studentRoutes from "./routes/studentRoutes";
import teacherRoutes from "./routes/teacherRoutes";
import publicRoutes from "./routes/publicRoutes";

// Importar modelos para que Sequelize los registre y sincronice
import "./models/Administrator";
import "./models/Student";
import "./models/Teaching";
import Administrator from "./models/Administrator";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Whitelist de orígenes permitidos
const whitelist = [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL || ''
].filter(Boolean);

const corsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        if (!origin || whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Bloqueado por CORS: Acceso denegado al recurso desde este origen.'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
};

app.use(cors(corsOptions));

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Rutas API
app.use("/auth", authRoutes);
app.use("/students", studentRoutes);
app.use("/teachers", teacherRoutes);
app.use("/public", publicRoutes);

// Redirigir raíz al login
app.get("/", (req, res) => {
    res.redirect("/login.html");
});

// Conexión a la base de datos y arranque del servidor
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Conexión a la base de datos establecida correctamente.");

        await sequelize.sync({ alter: true });
        console.log("✅ Modelos sincronizados con la base de datos.");

        // Crear admin por defecto si no existe
        const [, created] = await Administrator.findOrCreate({
            where: { email: "admin@appnotas.com" },
            defaults: {
                email: "admin@appnotas.com",
                password: await bcrypt.hash("admin123", 10),
                role: "admin"
            }
        });
        if (created) {
            console.log("✅ Admin creado: admin@appnotas.com / admin123");
        } else {
            console.log("ℹ️ Admin ya existe.");
        }

        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Error al conectar con la base de datos:", error);
        process.exit(1);
    }
};

startServer();