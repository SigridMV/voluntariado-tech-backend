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

const allowedOrigins = [
  "https://voluntariado-tech-frontend.onrender.com", 
];

// Middlewares globales
app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // permitir solicitudes sin origen (ej. Postman)
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = "La política CORS no permite este origen.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,  // si usas cookies o auth con credenciales
}));
app.use(express.json()); // Permite parsear solicitudes JSON

// Asignación de rutas a sus respectivos controladores
app.use("/api/auth", authRoutes); // Rutas que manejan autenticación
app.use("/api/users", userRoutes); // Rutas que manejan operaciones sobre usuarios
app.use("/api/availability", availabilityRoutes); // Rutas para manejar disponibilidad de los voluntarios
app.use("/api/bookings", bookingRoutes); // Rutas para manejar reservas

// Ruta base (raíz) para verificar si el servidor está funcionando
app.get("/", (req, res) => {
  res.send("API VoluntariadoTech funcionando");
});

// Exportación de la app para ser usada en server.js
module.exports = app;

