import express from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./config/database";
import authRoutes from "./routes/authRoutes";
import studentRoutes from "./routes/studentRoutes";
import teacherRoutes from "./routes/teacherRoutes";
import publicRoutes from "./routes/publicRoutes";

// Importar modelos para que Sequelize los registre y sincronice
import "./models/Administrator";
import "./models/Student";
import "./models/Teaching";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS estricto
// Aquí se definen los dominios autorizados (whitelist).
// Por defecto incluimos localhost, y en un despliegue como Azure, añadirías el dominio de producción.
const whitelist = ['http://localhost:3000', process.env.FRONTEND_URL || ''];

const corsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        // En desarrollo o clientes que no envían origin (herramientas como curl/postman)
        // se puede permitir dejando pasar !origin si se desea, o bloquearlo.
        // Aquí bloqueamos si no está en la whitelist y tiene origin.
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

        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Error al conectar con la base de datos:", error);
        process.exit(1);
    }
};

startServer();
