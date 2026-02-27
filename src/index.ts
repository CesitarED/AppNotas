import express from "express";
import path from "path";
import dotenv from "dotenv";
import sequelize from "./config/database";
import authRoutes from "./routes/authRoutes";
import studentRoutes from "./routes/studentRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Rutas API
app.use("/auth", authRoutes);
app.use("/students", studentRoutes);

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
