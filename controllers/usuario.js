import Usuario from "../models/usuario.js"

const getUsuario = async (req,res)=>{
    try {
        const usuarios= await Usuario.find()
        res.json({usuarios})
    } catch (error) {
        res.status(400).json({error})
    }
}

const postUsuario=async(req,res)=>{
    try {
         const {nombre,fecha_nacimiento,email,estado}=req.body

        const usuario= new Usuario({
            nombre,fecha_nacimiento,email,estado
        })

        await usuario.save()

         res.json({usuario,msg:"Usuario creado correctamente"})

    } catch (error) {
         res.status(400).json({error})
    }
}

const putUsuario=async(req,res)=>{
    try {
        const {nombre}=req.body
        const {id}=req.params

        await Usuario.findByIdAndUpdate(id,{nombre})

        res.json({msg:"Usuario modificado correctamente"})
    } catch (error) {
          res.status(400).json({error})
    }
    

}

const putUsuarioActivar=async(req,res)=>{
    try {
        const {id}=req.params

        await Usuario.findByIdAndUpdate(id,{estado:1})

        res.json({msg:"Usuario activado correctamente"})
    } catch (error) {
          res.status(400).json({error})
    }
    

}

const putUsuarioInactivar=async(req,res)=>{
    try {
        const {id}=req.params

        await Usuario.findByIdAndUpdate(id,{estado:0})

        res.json({msg:"Usuario inactivado correctamente"})
    } catch (error) {
          res.status(400).json({error})
    }
    

}

const deleteUsuario = async (req, res) => {
    try {
        const { correo } = req.params; 

        const usuarioEliminado = await Usuario.findOneAndDelete({ email: correo });

        if (!usuarioEliminado) {
            return res.status(404).json({ 
                msg: `No se encontró ningún usuario con el correo: ${correo}` 
            });
        }

        res.json({ 
            msg: "Usuario eliminado correctamente",
            usuarioEliminado 
        });
    } catch (error) {
        res.status(400).json({ error });
    }
};

export {getUsuario,postUsuario,putUsuario,putUsuarioActivar,putUsuarioInactivar,deleteUsuario}