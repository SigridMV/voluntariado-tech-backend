// src/routes/bookingRoutes.js

const express = require("express");
const router = express.Router();

// Controladores para gestionar reservas
const { createBooking, getMyBookings } = require("../controllers/bookingController");

// Middleware de autenticación para proteger las rutas
const authMiddleware = require("../middleware/authMiddleware");

/**
 * @route   POST /api/bookings
 * @desc    Crear una nueva reserva
 * @access  Privado (requiere autenticación)
 */
router.post("/", authMiddleware, createBooking);

/**
 * @route   GET /api/bookings/my
 * @desc    Obtener todas las reservas del usuario autenticado
 * @access  Privado (requiere autenticación)
 */
router.get("/my", authMiddleware, getMyBookings);

// Exportar el router para ser usado en app.js
module.exports = router;

