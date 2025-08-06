// src/middleware/roleMiddleware.js

/**
 * Middleware para controlar acceso basado en roles de usuario.
 *
 * @param {Array<string>} roles - Lista de roles permitidos para acceder a la ruta.
 * @returns Middleware que valida si el usuario tiene un rol permitido.
 *
 * Uso:
 * app.get("/admin", authMiddleware, roleMiddleware(["admin"]), controladorAdmin);
 */
const roleMiddleware = (roles) => {
  return (req, res, next) => {
    // Verifica que el rol del usuario esté en la lista de roles permitidos
    if (!roles.includes(req.user.role)) {
      // Si no está autorizado, devuelve error 403 Forbidden
      return res.status(403).json({ message: "Acceso no autorizado" });
    }

    // Si está autorizado, continúa al siguiente middleware o ruta
    next();
  };
};

module.exports = roleMiddleware;
