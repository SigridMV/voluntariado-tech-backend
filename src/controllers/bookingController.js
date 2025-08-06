// src/controllers/bookingController.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//
// ─── CREAR RESERVA ─────────────────────────────────────────────────────
//

/**
 * Crea una nueva reserva para un proyecto.
 * El usuario debe estar autenticado.
 * Evita duplicados por fecha y hora.
 */
const createBooking = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { projectId, date, time } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    if (!projectId || !date || !time) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    // Validar que el proyecto exista
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }

    // Verificar si ya existe una reserva similar
    const existingBooking = await prisma.booking.findFirst({
      where: {
        userId,
        projectId,
        date: new Date(date),
        time,
      },
    });

    if (existingBooking) {
      return res.status(409).json({
        message:
          "Ya tienes una reserva para este proyecto en esta fecha y hora",
      });
    }

    // Crear la reserva
    const newBooking = await prisma.booking.create({
      data: {
        userId,
        projectId,
        date: new Date(date),
        time,
      },
    });

    res.status(201).json(newBooking);
  } catch (error) {
    console.error("Error creando reserva:", error);
    res.status(500).json({ message: "Error al crear reserva" });
  }
};

//
// ─── RESERVAS DEL USUARIO ─────────────────────────────────────────────
//

/**
 * Devuelve todas las reservas del usuario autenticado.
 * Incluye detalles del proyecto relacionado.
 */
const getMyBookings = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        project: true,
      },
      orderBy: {
        date: "asc",
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
 * Permite a un usuario cancelar una reserva propia.
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

    if (booking.userId !== userId) {
      return res
        .status(403)
        .json({ message: "No puedes cancelar esta reserva" });
    }

    await prisma.booking.delete({ where: { id } });

    res.json({ message: "Reserva cancelada correctamente" });
  } catch (error) {
    console.error("Error cancelando reserva:", error);
    res.status(500).json({ message: "Error al cancelar reserva" });
  }
};

//
// ─── EXPORTAR FUNCIONES ────────────────────────────────────────────────
//

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
};
