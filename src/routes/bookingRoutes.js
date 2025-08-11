const express = require("express");
const router = express.Router();

const { createBooking, getMyBookings, cancelBooking } = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Crear reserva (solo escuelas)
router.post("/", authMiddleware, roleMiddleware(["school"]), createBooking);

router.get("/my", authMiddleware, getMyBookings);

// Obtener reservas propias (solo voluntarios)
router.get("/my-bookings", authMiddleware, roleMiddleware(["volunteer"]), getMyBookings);

// Cancelar reserva (solo escuelas)
router.delete("/:id", authMiddleware, roleMiddleware(["school"]), cancelBooking);

module.exports = router;

