import Pago from "../models/pagos.js"

const getPago = async (req, res) => {
    try {
        const pagos = await Pago.find()
        res.json({ pagos })
    } catch (error) {
        res.status(400).json({ error })
    }
}

const getByUsuario = async (req, res) => {
    try {
        const {email} = req.params;

        const pagos = await Pago.find({ usuario_email: email });
        res.json({ pagos })

    } catch (error) {
        res.status(400).json({ error })
    }
}

const crearPago = async (req, res) => {
    try {
        
      const {id, usuario_email, monto, fecha_pago, fecha_vencimiento, metodo} = req.body

      const pago = new Pago ({
        id, usuario_email, monto, fecha_pago, fecha_vencimiento, metodo
      })

      await pago.save()

      res.json({pago, msg:"Pago creado correctamente"})

    } catch (error) {
        res.status(400).json({ error })
    }
}

const getEstado = async (req, res) => {
    try {
        const {email} = req.params;

         const pago = await Pago.findOne({ usuario_email: email }).sort({ fecha_pago: -1 });

        if (!pago) {
            return res.json({ estado: "sin pagos" });
        }

        const ahora = new Date();
        const estado = ahora <= pago.fecha_vencimiento ? "activo" : "vencido";

        res.json({ estado })

    } catch (error) {
        res.status(400).json({ error })
    }
}


export {getPago, getByUsuario, crearPago, getEstado}