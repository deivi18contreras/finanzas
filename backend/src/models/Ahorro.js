import { Schema, model } from 'mongoose';

const AhorroSchema = new Schema(
    {
        usuarioId: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true
        },
        nombre: {
            type: String,
            required: [true, 'El nombre de la caja de ahorro es obligatorio'],
            trim: true
        },
        montoAcumulado: {
            type: Number,
            default: 0,
            min: [0, 'El monto acumulado no puede ser negativo']
        },
        meta: {
            type: Number,
            default: null,
            min: [0, 'La meta de ahorro no puede ser negativa']
        }
    },
    {
        timestamps: true
    }
);

AhorroSchema.index({ usuarioId: 1 });

export default model('Ahorro', AhorroSchema);
