import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    type: {
        type: String,
        enum: {
            values: ['income', 'expense'],
            message: '{VALUE} no es un tipo válido (debe ser income o expense)'
        },
        required: [true, 'El tipo de transacción es obligatorio']
    },
    amount: {
        type: Number,
        required: [true, 'El monto es obligatorio'],
        min: [1, 'El monto debe ser al menos 1'] 
    },
    category: {
        type: String,
        required: [true, 'La categoría es obligatoria'],
        trim: true,
        minlength: [3, 'La categoría debe tener al menos 3 caracteres']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [100, 'La descripción no puede pasar de 100 caracteres']
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            if (ret.date) {
                ret.date = ret.date.toLocaleDateString('es-CO'); 
            }
            return ret;
        }
    }
});

export default mongoose.model("Transaction", transactionSchema);