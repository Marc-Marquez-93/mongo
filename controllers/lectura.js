import Lectura from "../models/lecturas.js"

const getLectura= async (req,res)=>{
    try {
        const {email} = req.params;

        const lecturas= await Lectura.find({ usuario_email: email })
        res.json({lecturas})
    } catch (error) {
        res.status(400).json({error})
    }
}

const getLecturaId= async (req,res)=>{
    try {
        const {email} = req.params;

        const lecturas= await Lectura.find({ usuario_email: email })
        res.json({lecturas})
    } catch (error) {
        res.status(400).json({error})
    }
}

export {getLectura, getLecturaId}