export const errorHandler = (err, req, res, next) => {
  console.error("🔥 ERROR:", err);

  // error personalizado
  if (err.message.includes("Tipo de archivo")) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Error interno del servidor"
  });
};