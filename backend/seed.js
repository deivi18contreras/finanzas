import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Cargar variables de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

// Schema inline para no depender del modelo completo
const CategoriaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  icono:  { type: String, default: 'credit_card' },
  color:  { type: String, default: '#6366F1' },
  tipo:   { type: String, required: true, enum: ['ingreso', 'gasto', 'deudas'] },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true });

const Categoria = mongoose.models.Categoria || mongoose.model('Categoria', CategoriaSchema);

// ──────────────────────────────────────────────
// CATEGORÍAS BASE DEL SISTEMA (usuarioId: null)
// ──────────────────────────────────────────────

const GASTOS = [
  { nombre: 'Comida y Mercado',      icono: 'shopping_cart',          color: '#f43f5e' },
  { nombre: 'Restaurante',           icono: 'restaurant',             color: '#f97316' },
  { nombre: 'Servicios Públicos',    icono: 'receipt_long',           color: '#8b5cf6' },
  { nombre: 'Transporte',            icono: 'directions_bus',         color: '#0ea5e9' },
  { nombre: 'Entretenimiento',       icono: 'movie',                  color: '#ec4899' },
  { nombre: 'Salud y Farmacia',      icono: 'local_hospital',         color: '#10b981' },
  { nombre: 'Educación',             icono: 'school',                 color: '#6366f1' },
  { nombre: 'Ropa y Moda',           icono: 'checkroom',              color: '#f59e0b' },
  { nombre: 'Vivienda / Alquiler',   icono: 'home',                   color: '#64748b' },
  { nombre: 'Tecnología',            icono: 'devices',                color: '#3b82f6' },
  { nombre: 'Deporte y Gym',         icono: 'fitness_center',         color: '#22c55e' },
  { nombre: 'Mascotas',              icono: 'pets',                   color: '#a78bfa' },
  { nombre: 'Viajes',                icono: 'flight',                 color: '#06b6d4' },
  { nombre: 'Suscripciones',         icono: 'subscriptions',          color: '#e879f9' },
  { nombre: 'Otros Gastos',          icono: 'more_horiz',             color: '#94a3b8' },
];

const INGRESOS = [
  { nombre: 'Salario / Nómina',      icono: 'account_balance_wallet', color: '#10b981' },
  { nombre: 'Freelance',             icono: 'laptop_mac',             color: '#6366f1' },
  { nombre: 'Inversiones',           icono: 'trending_up',            color: '#0ea5e9' },
  { nombre: 'Alquiler Propio',       icono: 'home',                   color: '#f59e0b' },
  { nombre: 'Bonificaciones',        icono: 'star',                   color: '#f43f5e' },
  { nombre: 'Ventas',                icono: 'sell',                   color: '#22c55e' },
  { nombre: 'Otros Ingresos',        icono: 'more_horiz',             color: '#94a3b8' },
];

// ──────────────────────────────────────────────
// FUNCIÓN PRINCIPAL
// ──────────────────────────────────────────────

async function seed() {
  try {
    console.log('\n🔌 Conectando a MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conexión exitosa!\n');

    let creadas = 0;
    let existentes = 0;

    const insertar = async (lista, tipo) => {
      console.log(`\n📂 Procesando categorías de tipo: ${tipo.toUpperCase()}`);
      for (const cat of lista) {
        const existe = await Categoria.findOne({
          nombre: cat.nombre,
          tipo,
          usuarioId: null
        });

        if (existe) {
          console.log(`  ⏭  Ya existe: "${cat.nombre}"`);
          existentes++;
        } else {
          await Categoria.create({ ...cat, tipo, usuarioId: null });
          console.log(`  ✅ Creada:    "${cat.nombre}"`);
          creadas++;
        }
      }
    };

    await insertar(GASTOS,   'gasto');
    await insertar(INGRESOS, 'ingreso');

    console.log('\n─────────────────────────────────────────');
    console.log(`✅ Seed completado.`);
    console.log(`   Nuevas creadas: ${creadas}`);
    console.log(`   Ya existían:    ${existentes}`);
    console.log('─────────────────────────────────────────\n');

  } catch (error) {
    console.error('\n❌ Error durante el seed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB.\n');
    process.exit(0);
  }
}

seed();
