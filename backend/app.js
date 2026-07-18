import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import conectarMongo from './src/config/dataBase.js';
import authRoutes from './src/routes/authRoutes.js';
import transactionRoutes from './src/routes/transactionRoutes.js'
import deudaRoutes from './src/routes/deudaRoutes.js'
import categoriaRoutes from './src/routes/categoriaRoutes.js'
import presupuestoRoutes from './src/routes/presupuestoRoutes.js'
import ocrRoutes from './src/routes/ocrRoutes.js'
import gastoFijoRoutes from './src/routes/gastoFijoRoutes.js'
import ahorroRoutes from './src/routes/ahorroRoutes.js'
import reminderRoutes from './src/routes/reminderRoutes.js'


const app = express();
conectarMongo();
const PORT = process.env.PORT || 4500
 


app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


app.use('/api/auth',authRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/deudas', deudaRoutes);
app.use('/api/categoria', categoriaRoutes);
app.use('/api/presupuesto', presupuestoRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/gastos-fijos', gastoFijoRoutes);
app.use('/api/ahorros', ahorroRoutes);
app.use('/api/reminders', reminderRoutes);









app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API de Finanzas Personales corriendo' });
});


app.listen(PORT, () =>{
    console.log(`Servidor corriendo en el puerto ${PORT} `);
    
})