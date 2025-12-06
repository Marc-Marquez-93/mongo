import Lectura from "../models/lecturas.js"

const getUsuario= async (req,res)=>{
    try {
        const usuarios= await Usuario.find()
        res.json({usuarios})
    } catch (error) {
        res.status(400).json({error})
    }
}