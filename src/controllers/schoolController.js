// src/controllers/schoolController.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//
// ─── OBTENER ESCUELA POR ID ───────────────────────────────────────────
//

/**
 * Devuelve los datos de una escuela por su ID.
 * Si el usuario tiene rol "school", solo puede acceder a su propia escuela.
 */
async function getSchoolById(req, res) {
  const { id } = req.params;

  if (req.user.role === "school" && req.user.schoolId !== id) {
    return res
      .status(403)
      .json({ message: "No autorizado para acceder a esta escuela" });
  }

  try {
    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    if (!school) {
      return res.status(404).json({ message: "Escuela no encontrada" });
    }

    res.json(school);
  } catch (error) {
    console.error("Error al obtener escuela:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
}

//
// ─── ACTUALIZAR ESCUELA ───────────────────────────────────────────────
//

/**
 * Permite actualizar la información de una escuela.
 * El usuario con rol "school" solo puede modificar su propia escuela.
 */
async function updateSchool(req, res) {
  const { id } = req.params;
  const { school_name, contact_person, phone } = req.body;

  if (req.user.role === "school" && req.user.schoolId !== id) {
    return res
      .status(403)
      .json({ message: "No autorizado para actualizar esta escuela" });
  }

  try {
    const existing = await prisma.school.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: "Escuela no encontrada" });
    }

    const updated = await prisma.school.update({
      where: { id },
      data: {
        school_name,
        contact_person,
        phone,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error al actualizar escuela:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
}

//
// ─── EXPORTAR FUNCIONES ───────────────────────────────────────────────
//

module.exports = {
  getSchoolById,
  updateSchool,
};
