import mongoose from "mongoose";

const lectura = new mongoose.Schema({
  usuario_email: { type: String, required: true },
  tipo: { type: Number, default: 0 }, //0 principal   1 diaria
  contenido: { type: String, required: true },
  fecha_lectura: { type: Date, default: Date.now },
});

export default mongoose.model("Lectura", lectura);
