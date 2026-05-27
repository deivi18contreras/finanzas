import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import conectarMongo  from './src/config/dataBase.js';
import { notFound }    from './src/middleware/notFoundMiddleware.js';
import { errorHandler } from './src/middleware/errorMiddleware.js';
import transactionRoutes from './src/routes/transactionsRoutes.js'
import authRoutes from "./src/routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

conectarMongo();

/**
 * CORS FIX:
 * - Quitamos credentials: true → solo aplica si usas cookies.
 *   Esta app usa Bearer token en localStorage, NO cookies.
 *   `credentials: true` + `origin: '*'` es rechazado por los navegadores (spec W3C).
 * - La URL de producción se puede restringir con CORS_ORIGIN en .env de Render.
 */
app.use(cors({
  origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'https://finanzasfcb.netlify.app'
}));

app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use('/api/transactions', transactionRoutes);

app.get("/", (req, res) => {
  res.send("API Domina funcionando 🚀");
});

// Middlewares de error (siempre al final)
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Servidor Domina corriendo en puerto ${PORT}`);
});