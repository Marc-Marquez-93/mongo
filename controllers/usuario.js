import Usuario from "../models/usuario.js";
import bcryptjs from "bcryptjs";
import { generarJWT } from "../helpers/generar-jwt.js";
import { rolValido, enviarCorreo } from "../helpers/usuario.js";

// --- LOGIN (Genera el Token) ---
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Verificar si el email existe
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({
        msg: "Usuario / Password no son correctos - correo",
      });
    } 

    // 2. Verificar si el usuario está activo
    if (usuario.estado === 0) {
      return res.status(400).json({
        msg: "Usuario / Password no son correctos - estado: false",
      });
    }

    // 3. Verificar la contraseña (comparar la que llega con la encriptada en BD)
    const validPassword = bcryptjs.compareSync(password, usuario.password);
    if (!validPassword) {
      return res.status(400).json({
        msg: "Usuario / Password no son correctos - password",
      });
    }

    // 4. Generar el JWT
    const token = await generarJWT(usuario._id);

    enviarCorreo(
      email,
      "Nuevo inicio de sesión en tu app Numerologica",
      `Hola ${usuario.nombre}, haz iniciado sesion correctamente en nuestra app, es un gusto tenerte con nosotros 😍😍.`
    );

    res.json({
      usuario,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Hable con el administrador",
    });
  }
};

export const cambiarPassword = async (req, res) => {
    const { email, password } = req.body;

    try {
        const usuario = await Usuario.findOne({ email });

        if (!usuario) {
            return res.status(404).json({
                msg: "No se encontró un usuario con ese correo",
            });
        }

        // Encriptar la nueva contraseña definitiva
        const salt = bcryptjs.genSaltSync();
        usuario.password = bcryptjs.hashSync(password, salt);

        await usuario.save();

        // Avisar por correo del cambio exitoso
        enviarCorreo(
            email,
            "Seguridad: Tu contraseña ha sido cambiada",
            `Hola ${usuario.nombre}, te informamos que tu contraseña ha sido actualizada correctamente. Si no fuiste tú, contacta a soporte.`
        );

        res.json({
            msg: "Contraseña actualizada con éxito",
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error al actualizar la contraseña",
        });
    }
};

// bloque de restablecer contraseña

// 1. Solicitar recuperación (Genera el código de 6 dígitos)
const solicitarRecuperacion = async (req, res) => {
  const { email } = req.body;
  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado" });

    // Generar código de 6 dígitos aleatorio
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar en la BD con la hora actual
    usuario.claveDinamica = codigo;
    usuario.horaClaveDinamica = new Date();
    await usuario.save();

    // Enviar el correo con el código
    enviarCorreo(
      email,
      "Tu código de recuperación 🔑",
      `Hola ${usuario.nombre}, tu código para restablecer la contraseña es: ${codigo}. Tienes 30 minutos antes de que expire.`
    );

    res.json({ msg: "Código enviado al correo" });
  } catch (error) {
    res.status(500).json({ msg: "Error al solicitar recuperación" });
  }
};

// 2. Restablecer contraseña (Verifica código y tiempo)
const restablecerContraseña = async (req, res) => {
  const { email, claveDinamica, password } = req.body;
  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado" });

    // 1. Verificar si el código coincide
    if (usuario.claveDinamica !== claveDinamica) {
      return res.status(400).json({ msg: "El código es incorrecto" });
    }

    // 2. Verificar si han pasado más de 30 minutos
    const ahora = new Date();
    const diferenciaMinutos = (ahora - usuario.horaClaveDinamica) / (1000 * 60);

    if (diferenciaMinutos > 30) {
      return res.status(400).json({ msg: "El código ha expirado (más de 30 min)" });
    }

    // 3. Todo bien -> Encriptar nueva contraseña y limpiar campos
    const salt = bcryptjs.genSaltSync(10);
    usuario.password = bcryptjs.hashSync(password, salt);
    usuario.claveDinamica = null;
    usuario.horaClaveDinamica = null;
    await usuario.save();

    res.json({ msg: "Contraseña actualizada con éxito" });
  } catch (error) {
    res.status(500).json({ msg: "Error al restablecer contraseña" });
  }
};

// --- GET (Obtener usuario por email) ---
const getUsuario = async (req, res) => {
  try {
    const { email } = req.params;

    const usuarioExistente = await Usuario.findOne({ email });

    if (!usuarioExistente) {
      return res
        .status(404)
        .json({ msg: "No existe un usuario con ese correo" });
    }
    res.json({ usuario: usuarioExistente });
  } catch (error) {
    res.status(400).json({ error });
  }
};

// --- POST (Crear usuario con contraseña encriptada) ---
const postUsuario = async (req, res) => {
  try {
    const { nombre, password, fecha_nacimiento, email, rol, estado } = req.body;

    const Nrol = rolValido(rol);

    const usuario = new Usuario({
      nombre,
      password,
      fecha_nacimiento,
      email,
      rol: Nrol,
      estado,
    });

    // Encriptar la contraseña antes de guardar
    const salt = bcryptjs.genSaltSync(10);
    usuario.password = bcryptjs.hashSync(password, salt);

    await usuario.save();

    enviarCorreo(
    email,
    "¡Bienvenido a Numerología Profesional! 🔮",
    `Hola ${nombre}, tu cuenta ha sido creada con éxito. Ya puedes iniciar sesión y descubrir lo que los números dicen de ti.`
);

    res.json({ usuario, msg: "Usuario creado correctamente" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

// --- PUT (Actualizar usuario y re-encriptar contraseña si cambia) ---
const putUsuario = async (req, res) => {
  try {
    const { nombre, password, fecha_nacimiento, email_nuevo } = req.body;
    const { email } = req.params;

    const usuarioExistente = await Usuario.findOne({ email });

    if (!usuarioExistente) {
      return res
        .status(404)
        .json({ msg: "No existe un usuario con ese correo" });
    }

    // Validar si el nuevo correo ya existe (si es que lo están cambiando)
    if (email_nuevo && email_nuevo !== email) {
      const correoEnUso = await Usuario.findOne({ email: email_nuevo });
      if (correoEnUso) {
        return res
          .status(400)
          .json({ msg: "El nuevo correo ya está en uso por otro usuario" });
      }
    }

    // Manejo de la contraseña
    let passwordFinal = usuarioExistente.password; // Por defecto dejamos la que ya tenía
    if (password) {
        // Si enviaron una nueva contraseña, la encriptamos
        const salt = bcryptjs.genSaltSync();
        passwordFinal = bcryptjs.hashSync(password, salt);
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      usuarioExistente._id,
      {
        nombre,
        password: passwordFinal, // Usamos la variable controlada
        fecha_nacimiento,
        email: email_nuevo || email,
      },
      { new: true }
    );

    res.json({
      msg: "Usuario modificado correctamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      msg: "Error al actualizar",
      error,
    });
  }
};

// --- PUT (Activar) ---
const putUsuarioActivar = async (req, res) => {
  try {
    const { email } = req.params;

    const usuarioExistente = await Usuario.findOne({ email });

    if (!usuarioExistente) {
      return res
        .status(404)
        .json({ msg: "No existe un usuario con ese correo" });
    }

    await Usuario.findByIdAndUpdate(usuarioExistente._id, { estado: 1 });

    res.json({ msg: "Usuario activado correctamente" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

// --- PUT (Inactivar) ---
const putUsuarioInactivar = async (req, res) => {
  try {
    const { email } = req.params;

    const usuarioExistente = await Usuario.findOne({ email });

    if (!usuarioExistente) {
      return res
        .status(404)
        .json({ msg: "No existe un usuario con ese correo" });
    }

    await Usuario.findByIdAndUpdate(usuarioExistente._id, { estado: 0 });

    res.json({ msg: "Usuario inactivado correctamente" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

// --- DELETE ---
const deleteUsuario = async (req, res) => {
  try {
    const { email } = req.params;

    const usuarioEliminado = await Usuario.findOneAndDelete({ email });

    if (!usuarioEliminado) {
      return res.status(404).json({
        msg: `No se encontró ningún usuario con el correo: ${email}`,
      });
    }

    res.json({
      msg: "Usuario eliminado correctamente",
      usuarioEliminado,
    });
  } catch (error) {
    res.status(400).json({ error });
  }
};

export {
  login, 
  getUsuario,
  postUsuario,
  putUsuario,
  putUsuarioActivar,
  putUsuarioInactivar,
  deleteUsuario,
  cambiarPassword,
  restablecerContraseña,
  solicitarRecuperacion
};