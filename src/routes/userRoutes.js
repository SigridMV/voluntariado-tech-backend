// Importa Express y crea una nueva instancia del enrutador
const express = require("express");
const router = express.Router();

// Importa los controladores para manejar el registro y el inicio de sesión de usuarios
const { registerUser, loginUser } = require("../controllers/userController");

// Ruta POST para registrar un nuevo usuario
// Llama a registerUser cuando se hace una solicitud POST a /api/users/register
router.post("/register", registerUser);

// Ruta POST para iniciar sesión de usuario
// Llama a loginUser cuando se hace una solicitud POST a /api/users/login
router.post("/login", loginUser);

// Exporta el router para que pueda ser utilizado en app.js o index.js
module.exports = router;

