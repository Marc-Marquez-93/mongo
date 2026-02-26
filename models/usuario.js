import mongoose from "mongoose";

const usuario = new mongoose.Schema({
  nombre: { type: String, required: true },
  password: { type: String, required: true },
  fecha_nacimiento: { type: Date },
  email: { type: String, unique: true },
  rol: { type: String, enum: ["admin", "user"] }, //1 = admin  0 = user --- desde el controlador solo se recibe el numero y se convierte a string con la función rolValido
  estado: { type: Number, default: 1 }, //0 inactivo   1 activo
  claveDinamica: { type: String, default: null },
  horaClaveDinamica: { type: Date, default: null },
});

export default mongoose.model("Usuario", usuario);
