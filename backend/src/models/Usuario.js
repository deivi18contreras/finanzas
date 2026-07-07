import { Schema, model } from 'mongoose';


const UsuarioSchema = new Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre es obligatorio'],
            trim: true
        },

        email: {
            type: String,
            required: [true, 'El correo es obligatorio'],
            uniqued: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, 'La contraseña es obligatoria'],
        },
        monedaPrincipal: {
            type: String,
            default: 'COP'
        },
    },
    {
        timestamps: true,
    }
);


UsuarioSchema.methods.toJSON = function () {
  const { __v, password, ...usuario } = this.toObject();
  return usuario;
};

export default model('Usuario', UsuarioSchema);