import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import conectarMongo  from './src/config/dataBase.js';
import { notFound } from './src/middleware/notFoundMiddleware.js';
import { errorHandler } from './src/middleware/errorMiddleware.js';
import transactionRoutes from './src/routes/transactionsRoutes.js'
import authRoutes from "./src/routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

conectarMongo();

// Permitir peticiones desde tu App en Netlify y local
app.use(cors({
  origin: '*' // Permite todo por ahora para asegurar conexión, luego lo cerramos
}));
app.use(express.json());


//Rutas
app.use("/api/auth", authRoutes);
app.use('/api/transactions', transactionRoutes);

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

// Middlewares de error (Al final)
app.use(notFound);     
app.use(errorHandler);  






app.listen(PORT, () =>{
    console.log(`✅Servidor corriendo en puerto ${PORT}`); 
})