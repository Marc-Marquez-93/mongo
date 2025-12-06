import Lectura from "../models/lecturas.js"

const getLectura= async (req,res)=>{
    try {
        const lecturas= await Lectura.find()
        res.json({lecturas})
    } catch (error) {
        res.status(400).json({error})
    }
}

export {getLectura}