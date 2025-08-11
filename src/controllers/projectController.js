// controllers/projectController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener proyectos por escuela
const getProjectsBySchool = async (req, res) => {
  try {
    const schoolId = req.query.schoolId;
    if (!schoolId) {
      return res.status(400).json({ error: "Falta schoolId" });
    }

    const projects = await prisma.project.findMany({
      where: { schoolId: parseInt(schoolId) }
    });
    res.json(projects);

  } catch (error) {
    console.error("Error al obtener proyectos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Crear proyecto
const createProject = async (req, res) => {
  try {
    const { name, description, date, startTime, endTime, schoolId } = req.body;

    if (!name || !description || !date || !startTime || !endTime || !schoolId) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        date: new Date(date),
        startTime,
        endTime,
        schoolId: parseInt(schoolId),
      }
    });

    res.status(201).json(project);

  } catch (error) {
    console.error("Error al crear proyecto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Actualizar proyecto para reservar
const reserveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { volunteerId, volunteerName } = req.body;

    if (!volunteerId || !volunteerName) {
      return res.status(400).json({ error: "Faltan datos para reservar" });
    }

    const updatedProject = await prisma.project.update({
      where: { id: parseInt(id) },
      data: { reservedBy: volunteerId, reservedName: volunteerName }
    });

    res.json(updatedProject);

  } catch (error) {
    console.error("Error al reservar proyecto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
  getProjectsBySchool,
  createProject,
  reserveProject,
};
