export const errorHandler = (err, req, res, next) => {
  console.error("🔥 ERROR:", err.message);

  /**
   * BUGFIX CRÍTICO: El patrón usado en los controllers es:
   *   res.status(401);
   *   return next(new Error("mensaje"));
   *
   * Eso setea res.statusCode = 401 ANTES de llegar aquí.
   * Si usamos `err.status || 500`, sobreescribimos el 401 con 500.
   * La solución correcta es leer res.statusCode si ya fue modificado.
   */
  const statusCode = res.statusCode && res.statusCode !== 200
    ? res.statusCode
    : (err.statusCode || err.status || 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || "Error interno del servidor"
  });
};