// Cargar variables de entorn
// o desde el archivo .env
require("dotenv").config();
const cors = require("cors");

// Importar la aplicación configurada desde src/app.js
const app = require("./app.js");

// Importar middleware para manejar errores de forma centralizada
const { errorHandler } = require("./src/middleware/errorHandler.js");

// Definir el puerto donde se ejecutará el servidor, usando PORT desde .env o 4000 por defecto
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(cors({
  origin: ["https://voluntariado-tech-frontend.vercel.app", "http://localhost:5173"],
  credentials: true
}));

// Importar las rutas disponibles en el proyecto
const availabilityRoutes = require("./src/routes/availabilityRoutes.js");
const bookingRoutes = require("./src/routes/bookingRoutes.js");
const schoolRoutes = require("./src/routes/schoolRoutes.js");

// Definir los endpoints base para cada grupo de rutas
app.use("/api/availability", availabilityRoutes); // Rutas relacionadas con la disponibilidad de voluntarios
app.use("/api/booking", bookingRoutes);           // Rutas relacionadas con reservas
app.use("/api/school", schoolRoutes);             // Rutas relacionadas con colegios

app.use((req, res, next) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Middleware para manejar errores en toda la aplicación
app.use(errorHandler);

// Iniciar el servidor y mostrar mensaje en consola
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});


