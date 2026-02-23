const generarJWT = (uid) => {
  return new Promise((resolve, reject) => {
    const payload = { uid };
    jwt.sign(
      payload,
      process.env.SECRETORPRIVATEKEY,
      {
        expiresIn: "4h", //4h
      },
      (err, token) => {
        if (err) {
          console.log(err);
          reject("No se pudo generar el token");
        } else {
          resolve(token);
        }
      },
    );
  });
};

// ---

const reeee =  {login:  async (req, res) => {
const { email, password } = req.body;
try {
const holder = await Holder.findOne({ email })
if (!holder) {
return res.status(400).json({
msg: "Holder / Password no son correctos"

})
}
if (holder.estado === 0) {
return res.status(400).json({
msg: "Holder Inactivo"
})
}
const validPassword = bcryptjs.compareSync(password, holder.password);
if (!validPassword) {
return res.status(400).json({
msg: "Holder / Password no son correctos"
})
}
const token = await generarJWT(holder.id);
res.json({
holder,
token
})
} catch (error) {
return res.status(500).json({
msg: "Hable con el WebMaster"
})
}} }
 
// ---

const validarJWT = async (req, res, next) => {
const token = req.header("x-token");
if (!token) {
return res.status(401).json({
msg: "No hay token en la peticion"
})
}
try {
const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)
let usuario = await Holder.findById(uid);
if (!usuario) {
return res.status(401).json({
msg: "Token no válido "//- usuario no existe DB
})
}
if (usuario.estado == 0) {
return res.status(401).json({
msg: "Token no válido " //- usuario con estado: false
})
}
req.usuario=usuario //- pasamos el usuario al request para poder usarlo en cualquier
// peticion
next();
} catch (error) {
res.status(401).json({
msg: "Token no valido"
})
}
}
