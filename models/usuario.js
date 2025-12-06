import mongoose from "mongoose";

const usuario = new mongoose.Schema({
    nombre:{type:String,require:true},
    edad:{type:Number},
    fecha_nacimiento:{type:Date},
    email:{type:String,unique:true},
    estado:{type:Number,default:1}//0 inactivo   1 activo
});

export default mongoose.model("Usuario",usuario)