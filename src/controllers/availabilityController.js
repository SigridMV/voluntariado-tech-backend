// src/controller/availabilityController.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//
// ─── CREAR DISPONIBILIDAD ──────────────────────────────────────────────
//

/**
 * Crea un nuevo slot de disponibilidad para un voluntario.
 * Puede determinar el volunteer_id automáticamente si el usuario está autenticado.
 */
const createAvailability = async (req, res) => {
  try {
    const userId = req.user?.id;
    let volunteerId = req.body.volunteer_id;

    // Si el usuario está autenticado como voluntario, se obtiene su volunteer_id automáticamente
    if (userId) {
      const volunteer = await prisma.volunteer.findUnique({
        where: { user_id: userId },
      });

      if (!volunteer) {
        return res.status(403).json({ message: "No autorizado" });
      }

      volunteerId = volunteer.id;
    }

    const { date, start_time, end_time } = req.body;

    if (!volunteerId || !date || !start_time || !end_time) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    const newAvailability = await prisma.availability.create({
      data: {
        volunteer_id: volunteerId,
        date: new Date(date),
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        reserved: false,
      },
    });

    res.status(201).json(newAvailability);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear disponibilidad" });
  }
};

//
// ─── CONSULTAR DISPONIBILIDAD PROPIA ────────────────────────────────────
//

/**
 * Devuelve todos los slots de disponibilidad del voluntario autenticado.
 */
const getMyAvailability = async (req, res) => {
  try {
    const userId = req.user.id;

    const volunteer = await prisma.volunteer.findUnique({
      where: { user_id: userId },
    });

    if (!volunteer) return res.status(403).json({ message: "No autorizado" });

    const availabilities = await prisma.availability.findMany({
      where: { volunteer_id: volunteer.id },
      orderBy: { date: "asc" },
    });

    res.json(availabilities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener disponibilidad" });
  }
};

//
// ─── ELIMINAR DISPONIBILIDAD ───────────────────────────────────────────
//

/**
 * Elimina una disponibilidad por ID si no ha sido reservada.
 */
const deleteAvailability = async (req, res) => {
  try {
    const userId = req.user.id;

    const volunteer = await prisma.volunteer.findUnique({
      where: { user_id: userId },
    });

    if (!volunteer) return res.status(403).json({ message: "No autorizado" });

    const { id } = req.params;

    const availability = await prisma.availability.findUnique({
      where: { id },
    });
    if (!availability)
      return res.status(404).json({ message: "No encontrada" });

    if (availability.reserved) {
      return res
        .status(400)
        .json({ message: "No se puede eliminar, está reserved" });
    }

    await prisma.availability.delete({ where: { id } });
    res.json({ message: "Disponibilidad eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar disponibilidad" });
  }
};

//
// ─── DISPONIBILIDAD POR VOLUNTARIO ─────────────────────────────────────
//

/**
 * Devuelve los slots de disponibilidad para un voluntario específico.
 * @param volunteerId - ID del voluntario (parámetro de ruta)
 */
const getAvailabilityByVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.params;

    const availability = await prisma.availability.findMany({
      where: { volunteer_id: volunteerId },
      orderBy: { date: "asc" },
    });

    res.json(availability);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo disponibilidad" });
  }
};

//
// ─── DISPONIBILIDAD FILTRADA (PUBLICA) ─────────────────────────────────
//

/**
 * Devuelve slots de disponibilidad no reserveds, con filtros opcionales:
 * - specialty: área de especialidad del voluntario
 * - modality: presencial/online
 * - date: fecha específica
 */
const getAvailableSlots = async (req, res) => {
  try {
    const { specialty, modality, date } = req.query;

    // Filtros para encontrar voluntarios válidos
    const volunteerFilters = {
      ...(specialty ? { specialties: { has: specialty } } : {}),
      ...(modality ? { modality } : {}),
    };

    const volunteers = await prisma.volunteer.findMany({
      where: volunteerFilters,
      select: {
        id: true,
        user: {
          select: { name: true, email: true },
        },
        specialties: true,
        modality: true,
      },
    });

    const volunteerIds = volunteers.map((v) => v.id);

    // Filtros para buscar disponibilidades asociadas a los voluntarios
    const availabilityFilters = {
      reserved: false,
      volunteer_id: { in: volunteerIds },
      ...(date ? { date: new Date(date) } : {}),
    };

    const availabilities = await prisma.availability.findMany({
      where: availabilityFilters,
      orderBy: [{ date: "asc" }, { start_time: "asc" }],
      include: {
        volunteer: {
          select: {
            specialties: true,
            modality: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    // Formateo del resultado para respuesta más clara
    const result = availabilities.map((s) => ({
      id: s.id,
      date: s.date.toISOString().split("T")[0],
      start_time: s.start_time.toISOString().split("T")[1].substring(0, 8),
      end_time: s.end_time.toISOString().split("T")[1].substring(0, 8),
      volunteer_id: s.volunteer_id,
      volunteer: {
        name: s.volunteer.user.name,
        email: s.volunteer.user.email,
        specialties: s.volunteer.specialties,
        modality: s.volunteer.modality,
      },
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener disponibilidades" });
  }
};

//
// ─── EXPORTAR FUNCIONES ────────────────────────────────────────────────
//

module.exports = {
  createAvailability,
  getMyAvailability,
  deleteAvailability,
  getAvailabilityByVolunteer,
  getAvailableSlots,
};
