import { Schema, model } from "mongoose";
import Usuario from "./Usuario.js";

const CategoriaSchema = new Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre de la categoria es obligatoria'],
            trim: true
        },
        icono: {
            type: String,
            required: true,
            default: 'credit_card'
        },
        color: {
            type: String,
            required: true,
            default: '#6366F1'
        },
        tipo: {
            type: String,
            required: true,
            enum: ['ingreso', 'gasto', 'deudas'],
        },
        usuarioId: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario',
            default: null
        }
    },
    {
        timestamps: true
    }
)

CategoriaSchema.index({usuarioId: 1, tipo: 1});

export default model('Categoria', CategoriaSchema);