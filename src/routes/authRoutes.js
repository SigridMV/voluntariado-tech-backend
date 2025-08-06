// src/routes/authRoutes.js
const express = require("express");
const router = express.Router();

// Importa los controladores de autenticación (registro y login)
const { register, login } = require("../controllers/authController");

/**
 * Ruta POST /register
 * Endpoint para registrar un nuevo usuario.
 * Recibe datos en el body (name, email, password, role)
 * Llama al controlador `register` que maneja la lógica.
 */
router.post("/register", register);

/**
 * Ruta POST /login
 * Endpoint para iniciar sesión.
 * Recibe email y password en el body.
 * Llama al controlador `login` que valida credenciales y devuelve token.
 */
router.post("/login", login);

module.exports = router;
