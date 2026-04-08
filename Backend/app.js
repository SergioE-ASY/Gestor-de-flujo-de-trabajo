const express = require("express");
const cors = require("cors");
const { sequelize } = require("./server/db");

const userRoutes = require("./server/routes/userRoutes");
const orgRoutes = require("./server/routes/orgRoutes");
const attachmentRoutes = require("./server/routes/attachmentRoutes");
const commentRoutes = require("./server/routes/commentRoutes");
const notificationRoutes = require("./server/routes/notificationRoutes");
const projectRoutes = require("./server/routes/projectRoutes");
const sprintRoutes = require("./server/routes/sprintRoutes");
const taskRoutes = require("./server/routes/taskRoutes");
const tagRoutes = require("./server/routes/tagRoutes");
const timeLogRoutes = require("./server/routes/timeLogRoutes");
const projectMemberRoutes = require("./server/routes/projectMemberRoutes");
const organizationUserRoutes = require("./server/routes/organizationUserRoutes");
const taskTagRoutes = require("./server/routes/taskTagRoutes");

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

// Rutas de la API (CRUD y endpoints personalizados)
app.use("/api/users", userRoutes);
app.use("/api/organizations", orgRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/sprints", sprintRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/time-logs", timeLogRoutes);
app.use("/api/project-members", projectMemberRoutes);
app.use("/api/organization-users", organizationUserRoutes);
app.use("/api/task-tags", taskTagRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

setInterval(() => {
   
}, 10000000);

// Agrega esto temporalmente al inicio de app.js


module.exports = app;