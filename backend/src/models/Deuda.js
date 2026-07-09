import { Schema, model } from "mongoose";

const DeudaSchema = new Schema(
    {
        usuarioId: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true
        },
        tipo: {
            type: String,
            required: true,
            enum: ['por_pagar', 'por_cobrar']
        },
        contacto: {
            type: String,
            required: [true, ' El nombre de la persona es obligatoria'],
            trim: true,
        },
        descripcion: {
            type: String,
            trim: true,
            default: ''
        },
        montoTotal: {
            type: Number,
            required: [true, 'El monto total de la deuda es obligatoria'],
            min: [0, 'El monto no debe ser negativo']
        },
        montoPagado: {
            type: Number,
            default: 0
        },
        estado: {
            type: String,
            required: true,
            enum: ['pendiente', 'liquidada'],
            default: 'pendiente'
        },
        fechaLimite: {
            type: Date
        },
        historialAbonos: [
            {
                transaccionId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Transaccion'
                },
                montoAbonado: Number,
                fechaAbono: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

DeudaSchema.index({ usuarioId: 1, estado: 1 });

export default model('Deuda', DeudaSchema)