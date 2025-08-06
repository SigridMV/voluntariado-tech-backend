// src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken"); // Librería para manejo de JWT
require("dotenv").config(); // Carga variables de entorno desde .env

/**
 * Middleware para verificar el token JWT enviado en el header Authorization
 *
 * Espera el header: Authorization: Bearer <token>
 * Si el token es válido, decodifica y adjunta la info del usuario a req.user
 * Si no, responde con error 401 (no autorizado)
 */
const authMiddleware = (req, res, next) => {
  // Obtener el header Authorization
  const authHeader = req.headers.authorization;

  // Validar que el header exista
  if (!authHeader) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  // Extraer el token (asumiendo formato "Bearer <token>")
  const token = authHeader.split(" ")[1];

  // Validar que el token exista
  if (!token) {
    return res.status(401).json({ message: "Token inválido" });
  }

  try {
    // Verificar el token usando la clave secreta definida en variables de entorno
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adjuntar la información decodificada (payload) al request para uso en siguientes middlewares o rutas
    req.user = decoded; // ej: { id, email, role, schoolId }

    // Pasar al siguiente middleware o controlador
    next();
  } catch (error) {
    // Capturar error de token inválido o expirado y responder con 401
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

module.exports = authMiddleware;
