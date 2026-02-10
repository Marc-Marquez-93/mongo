import Usuario from "../models/usuario.js";

const getUsuario = async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json({ usuarios });
  } catch (error) {
    res.status(400).json({ error });
  }
};

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

    await usuario.save();

    res.json({ usuario, msg: "Usuario creado correctamente" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

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

    const correoEnUso = await Usuario.findOne({ email: email_nuevo });
    if (correoEnUso) {
      return res
        .status(400)
        .json({ msg: "El nuevo correo ya está en uso por otro usuario" });
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      usuarioExistente._id,
      {
        nombre,
        password,
        fecha_nacimiento,
        email: email_nuevo || email,
      },
      { new: true },
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
  getUsuario,
  postUsuario,
  putUsuario,
  putUsuarioActivar,
  putUsuarioInactivar,
  deleteUsuario,
};
