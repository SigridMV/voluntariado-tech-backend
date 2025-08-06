// routes/projects.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener proyectos por escuela (schoolId)
router.get('/', async (req, res) => {
  const schoolId = req.query.schoolId;
  if (!schoolId) return res.status(400).json({ error: "Falta schoolId" });

  const projects = await prisma.project.findMany({
    where: { schoolId: parseInt(schoolId) }
  });
  res.json(projects);
});

// Crear proyecto
router.post('/', async (req, res) => {
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
});

// Actualizar proyecto para reservar (ejemplo)
router.put('/:id/reserve', async (req, res) => {
  const { id } = req.params;
  const { volunteerId, volunteerName } = req.body;

  const updatedProject = await prisma.project.update({
    where: { id: parseInt(id) },
    data: { reservedBy: volunteerId, reservedName: volunteerName }
  });

  res.json(updatedProject);
});

module.exports = router;
