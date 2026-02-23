import mongoose from "mongoose";

const pago = new mongoose.Schema({
  usuario_email: { type: String, required: true },
  fecha_pago: { type: Date, default: Date.now },
  metodo: { type: Number, default: 0 }, //0 tarjeta   1 efectivo 2 transferencia
  vencimiento: { type: Date },
});
export default mongoose.model("Pago", pago);
