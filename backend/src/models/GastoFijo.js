import { Schema, model } from 'mongoose';

const GastoFijoSchema = new Schema(
    {
        usuarioId: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true
        },
        nombre: {
            type: String,
            required: [true, 'El nombre del gasto fijo es obligatorio'],
            trim: true
        },
        monto: {
            type: Number,
            required: [true, 'El monto es obligatorio'],
            min: [0, 'El monto no puede ser negativo']
        },
        categoria: {
            type: String,
            required: [true, 'La categoría es obligatoria']
        },
        diaPago: {
            type: Number,
            min: 1,
            max: 31,
            default: 1
        },
        activo: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

GastoFijoSchema.index({ usuarioId: 1 });

export default model('GastoFijo', GastoFijoSchema);