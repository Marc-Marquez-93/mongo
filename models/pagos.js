import mongoose from "mongoose";

const pago = new mongoose.Schema({
    id:{type:Number,require:true},
    usuario_email:{type:String, require:true},
    fecha_pago: {type:Date, default:Date.now},
    metodo: {type:Number, default:0}//0 tarjeta   1 efectivo 2 transferencia
})

export default mongoose.model("Pago", pago)