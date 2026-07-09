import { Schema, model } from "mongoose";
import Categoria from "./Categoria.js";

const PresupuestoSchema = new Schema (
    {
        usuarioId: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true
        },
        categoria:{
            type: String,
            required: true
        },
        anio:{
            type: Number,
            required: true
        },
        montoLimite:{
            type: Number,
            required: [true, 'El monto limite del presupuesto es obligatorio'],
            min: [0, 'El limite no puede ser negativo']
        },
        mes: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

PresupuestoSchema.index({ usuarioId: 1, anio: 1, mes: 1 });

export default model('Presupuesto', PresupuestoSchema);