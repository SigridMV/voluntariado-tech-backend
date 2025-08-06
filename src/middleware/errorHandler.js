/**
 * Middleware global para manejo de errores en Express.
 *
 * Recibe el error que ocurrió en cualquier parte del flujo, lo registra en consola,
 * y envía una respuesta JSON con el mensaje y código de estado apropiado.
 *
 * Parámetros:
 * - err: objeto de error que puede contener statusCode y message
 * - req: objeto request de Express
 * - res: objeto response de Express
 * - next: función para pasar el control al siguiente middleware
 */
function errorHandler(err, req, res, next) {
  // Registrar el error en consola para debug
  console.error(err);

  // Si la respuesta ya fue enviada, pasar el error al siguiente manejador
  if (res.headersSent) {
    return next(err);
  }

  // Enviar respuesta JSON con código y mensaje de error
  res.status(err.statusCode || 500).json({
    message: err.message || "Error interno del servidor",
  });
}

module.exports = { errorHandler };
