// app.js

// Importación de módulos
const express = require("express");
const cors = require("cors");

// Importación de rutas
const authRoutes = require("./src/routes/authRoutes"); // Rutas para autenticación (login, registro)
const userRoutes = require("./src/routes/userRoutes"); // Rutas relacionadas a los usuarios (perfil, etc.)
const availabilityRoutes = require("./src/routes/availabilityRoutes.js"); // Rutas para disponibilidad de voluntarios
const bookingRoutes = require("./src/routes/bookingRoutes"); // Rutas para reservas de voluntarios

// Creación de la aplicación de Express
const app = express();
const projectRoutes = require("./src/routes/projectRoutes.js");

// Middlewares globales
app.use(cors({
  origin: ["https://voluntariado-tech-frontend.vercel.app", "http://localhost:5173"],
  credentials: true
}));

app.use(express.json()); // Permite parsear solicitudes JSON

// Asignación de rutas a sus respectivos controladores
app.use("/api/auth", authRoutes); // Rutas que manejan autenticación
app.use("/api/users", userRoutes); // Rutas que manejan operaciones sobre usuarios
app.use("/api/availability", availabilityRoutes); // Rutas para manejar disponibilidad de los voluntarios
app.use("/api/bookings", bookingRoutes); // Rutas para manejar reservas
app.use("/api/projects", projectRoutes);

// Ruta base (raíz) para verificar si el servidor está funcionando
app.get("/", (req, res) => {
  res.send("API VoluntariadoTech funcionando");
});

// Exportación de la app para ser usada en server.js
module.exports = app;

