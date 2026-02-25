import Usuario from "../models/usuario.js";
import bcryptjs from "bcryptjs";
import { generarJWT } from "../helpers/generar-jwt.js";

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
    const { nombre, password, fecha_nacimiento, email, estado } = req.body;

    const usuario = new Usuario({
      nombre,
      password,
      fecha_nacimiento,
      email,
      estado,
    });

    // Encriptar la contraseña antes de guardar
    const salt = bcryptjs.genSaltSync();
    usuario.password = bcryptjs.hashSync(password, salt);

    await usuario.save();

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
};