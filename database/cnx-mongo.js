import mongoose from "mongoose";

export const conectarMongo=()=>{
    mongoose.connect('mongodb://127.0.0.1:27017/numerologia')
  .then(() => console.log('BD conectada!'));
}

