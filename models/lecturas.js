import mongoose from "mongoose";

const lectura = new mongoose.Schema({
    id:{type:Number,require:true},
    usuario_email:{type:String,require:true},
    tipo: {type:Number,default:0},//0 principal   1 diaria
    contenido: {type:String, require:true},
    fecha_lectura: {type:Date, default:Date.now},
})

export default mongoose.model("Lectura",lectura)