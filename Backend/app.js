const express = require("express");
const cors = require("cors");
const { sequelize } = require("./server/db");

const userRoutes = require("./routes/userRoutes");
const orgRoutes = require("./routes/orgRoutes");
const attachmentRoutes = require("./routes/attachmentRoutes");


process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Shutting down...');
    process.exit(0);
});

process.on('exit', (code) => {
    console.log(`Process exited with code: ${code}`);
});

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check / Test route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", project: "HGP - Herramienta de Gestión de Proyectos" });
});

// Rutas para manejo de imágenes/adjuntos (bytea)
app.use("/api/users", userRoutes);
app.use("/api/organizations", orgRoutes);
app.use("/api/attachments", attachmentRoutes);


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

setInterval(() => {
   
}, 10000000);

// Agrega esto temporalmente al inicio de app.js


module.exports = app;