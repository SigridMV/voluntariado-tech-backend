const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//
// ─── CREAR RESERVA ─────────────────────────────────────────────────────
//

/**
 * Crea una nueva reserva para un slot de disponibilidad.
 * El usuario debe ser una escuela autenticada.
 * Valida que la disponibilidad exista y no esté reservada.
 */
const createBooking = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const { availabilityId } = req.body;

    if (!availabilityId) {
      return res.status(400).json({ message: "Falta availabilityId" });
    }

    // Buscar escuela asociada al usuario
    const school = await prisma.school.findUnique({
      where: { user_id: userId },
    });

    if (!school) {
      return res.status(403).json({ message: "Solo escuelas pueden reservar" });
    }

    // Buscar disponibilidad
    const availability = await prisma.availability.findUnique({
      where: { id: availabilityId },
    });

    if (!availability) {
      return res.status(404).json({ message: "Disponibilidad no encontrada" });
    }

    if (availability.reserved) {
      return res.status(400).json({ message: "Disponibilidad ya reservada" });
    }

    // Crear reserva
    const booking = await prisma.booking.create({
      data: {
        school_id: school.id,
        availability_id: availabilityId,
        status: "pendiente",
        created_at: new Date(),
      },
    });

    // Marcar disponibilidad como reservada
    await prisma.availability.update({
      where: { id: availabilityId },
      data: { reserved: true },
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error("Error creando reserva:", error);
    res.status(500).json({ message: "Error al crear reserva" });
  }
};

//
// ─── RESERVAS DEL VOLUNTARIO ───────────────────────────────────────────
//

/**
 * Devuelve las reservas de slots para el voluntario autenticado.
 */
const getMyBookings = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    // Obtener el voluntario vinculado al user
    const volunteer = await prisma.volunteer.findUnique({
      where: { user_id: userId },
    });

    if (!volunteer) {
      return res.status(403).json({ message: "No autorizado" });
    }

    // Obtener reservas donde la disponibilidad es del voluntario
    const bookings = await prisma.booking.findMany({
      where: {
        availability: {
          volunteer_id: volunteer.id,
        },
      },
      include: {
        availability: true,
        school: true,
      },
      orderBy: {
        availability: {
          date: "asc",
        },
      },
    });

    res.json(bookings);
  } catch (error) {
    console.error("Error obteniendo reservas:", error);
    res.status(500).json({ message: "Error al obtener reservas" });
  }
};

//
// ─── CANCELAR RESERVA ──────────────────────────────────────────────────
//

/**
 * Permite cancelar reserva propia.
 */
const cancelBooking = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    // Verificar que la reserva pertenezca a la escuela o voluntario según el caso
    // Por simplicidad, asumimos solo escuelas cancelan sus reservas:
    const school = await prisma.school.findUnique({
      where: { user_id: userId },
    });
    if (!school || booking.school_id !== school.id) {
      return res
        .status(403)
        .json({ message: "No puedes cancelar esta reserva" });
    }

    // Actualizar disponibilidad para poner reserved en false
    await prisma.availability.update({
      where: { id: booking.availability_id },
      data: { reserved: false },
    });

    await prisma.booking.delete({ where: { id } });

    res.json({ message: "Reserva cancelada correctamente" });
  } catch (error) {
    console.error("Error cancelando reserva:", error);
    res.status(500).json({ message: "Error al cancelar reserva" });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
};
