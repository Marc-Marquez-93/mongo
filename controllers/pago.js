import Pago from "../models/pagos.js";
import Usuario from "../models/usuario.js";

const getPago = async (req, res) => {
  try {
    const pagos = await Pago.find();
    res.json({ pagos });
  } catch (error) {
    res.status(400).json({ error });
  }
};

const getByUsuario = async (req, res) => {
  try {
    const { email } = req.params;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    const pagos = await Pago.find({ usuario_email: email });
    res.json({ pagos });
  } catch (error) {
    res.status(400).json({ error });
  }
};

const crearPago = async (req, res) => {
  try {
    const { usuario_email, fecha_pago, metodo } = req.body;

    const usuario = await Usuario.findOne({ email: usuario_email });
    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    const fechaBase = fecha_pago ? new Date(fecha_pago) : new Date();

    const vencimiento = new Date(fechaBase);
    vencimiento.setDate(vencimiento.getDate() + 30);

    const pago = new Pago({
      usuario_email,
      fecha_pago: fechaBase,
      metodo,
      vencimiento,
    });

    await pago.save();
    res.json({
      pago,
      msg: "Pago creado correctamente con vencimiento a 30 días",
    });
  } catch (error) {
    res.status(400).json({ error });
  }
};

const getEstado = async (req, res) => {
  try {
    const { email } = req.params;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    const pago = await Pago.findOne({ usuario_email: email }).sort({
      fecha_pago: -1,
    });

    if (!pago) {
      return res.json({ estado: "sin pagos" });
    }

    const ahora = new Date();

    const estado = ahora <= pago.vencimiento ? "activo" : "vencido";

    res.json({
      estado,
      vencimiento: pago.vencimiento,
    });
  } catch (error) {
    res.status(400).json({ error });
  }
};

export { getPago, getByUsuario, crearPago, getEstado };
