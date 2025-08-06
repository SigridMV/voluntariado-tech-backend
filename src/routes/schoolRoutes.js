// Importación de Express y creación del router
const express = require("express");
const router = express.Router();

// Importación de los controladores necesarios
const { getSchoolById, updateSchool } = require("../controllers/schoolController");

// Importación del middleware de autenticación
const authMiddleware = require("../middleware/authMiddleware");

// Aplica el middleware de autenticación a todas las rutas de este router
// Esto asegura que solo usuarios autenticados puedan acceder a estas rutas
router.use(authMiddleware);

// Ruta GET para obtener la información de una escuela por su ID
// Ejemplo: GET /api/schools/123
router.get("/:id", getSchoolById);

// Ruta PUT para actualizar los datos de una escuela por su ID
// Ejemplo: PUT /api/schools/123
router.put("/:id", updateSchool);

// Exportación del router para que pueda ser usado en la app principal
module.exports = router;
