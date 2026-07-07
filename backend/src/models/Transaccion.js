import { Schema, model } from 'mongoose';

const TransaccionSchema = new Schema(
    {
        usuarioId: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true
        },
        tipo: {
            type: String,
            required: true,
            enum: ['ingreso', 'gasto', 'deudas']
        },
        monto: {
            type: Number,
            required: [true, 'El monto es obligatorio'],
            min: [0, 'El monto no puede ser negativo']
        },
        categoria: {
            type: String,
            required: [true, 'La categoria es obligatoria'],
        },
        descripcion: {
            type: String,
            trim: true,
            default: ''
        },
        fecha: {
            type: Date,
            required: true,
            default: Date.now
        },
    },
    {
        timestamps: true
    });


    TransaccionSchema.index({usuarioId: 1, fecha: -1});

    export default model('Transaccion', TransaccionSchema)