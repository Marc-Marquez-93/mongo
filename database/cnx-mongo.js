import mongoose from "mongoose";

export const conectarMongo=()=>{
    mongoose.connect('mongodb://localhost:27017/numerologia')
  .then(() => console.log('BD conectada!'));
}

