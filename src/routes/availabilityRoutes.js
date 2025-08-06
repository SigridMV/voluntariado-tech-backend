// Importamos express y creamos un enrutador
const express = require("express");
const router = express.Router();

// Importamos los controladores correspondientes a disponibilidad
const {
  createAvailability,
  getMyAvailability,
  deleteAvailability,
  getAvailabilityByVolunteer,
  getAvailableSlots,
} = require("../controllers/availabilityController");

// Importamos middlewares de autenticación y autorización por rol
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

/**
 * Rutas para manejar la disponibilidad de los voluntarios
 */

// ✅ Crear una nueva disponibilidad (solo voluntarios autenticados)
router.post(
  "/",
  authMiddleware, // Verifica que el usuario esté autenticado
  roleMiddleware(["volunteer"]), // Verifica que el rol del usuario sea 'volunteer'
  createAvailability // Controlador que maneja la creación
);

// ✅ Obtener todas las disponibilidades del usuario autenticado
router.get(
  "/my",
  authMiddleware, // Solo usuarios autenticados pueden acceder
  getMyAvailability // Devuelve las disponibilidades del usuario actual
);

// ✅ Eliminar una disponibilidad específica del usuario autenticado
router.delete(
  "/:id",
  authMiddleware, // Verifica autenticación
  deleteAvailability // Elimina la disponibilidad con el ID proporcionado
);

// ✅ Obtener todos los horarios de disponibilidad que NO están reserveds
router.get(
  "/available",
  authMiddleware, // Solo accesible para usuarios autenticados
  getAvailableSlots // Devuelve slots disponibles opcionalmente filtrados
);

// ✅ Obtener disponibilidad de un voluntario específico por su ID
router.get(
  "/volunteer/:volunteerId",
  authMiddleware, // Verifica autenticación
  getAvailabilityByVolunteer // Devuelve disponibilidades de un voluntario específico
);

// Exportamos el enrutador para usarlo en app.js o server.js
module.exports = router;
