import mongoose from "mongoose";

export const conectarMongo=()=>{
    mongoose.connect('mongodb://127.0.0.1:27017/borraradso259')
  .then(() => console.log('BD conectada!'));
}

