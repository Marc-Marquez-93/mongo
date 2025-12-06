import Lectura from "../models/lecturas.js"
import Pago from "../models/pagos.js"

const getLectura = async (req, res) => {
    try {
        const { email } = req.params;

        const lecturas = await Lectura.find({ usuario_email: email })
        res.json({ lecturas })
    } catch (error) {
        res.status(400).json({ error })
    }
}

const getLecturaId = async (req, res) => {
    try {
        const { Id } = req.params;

        const lectura = await Lectura.findOne({ id: Id })
        res.json({ lectura })
    } catch (error) {
        res.status(400).json({ error })
    }
}


const postLecturaPrincipal = async (req, res) => {
    try {
        const { email } = req.params;
        const { id, contenido } = req.body;
        const tipo = 0;

         const existePrincipal = await Lectura.findOne({ usuario_email: email, tipo: 0 });

        if (existePrincipal) {
            return res.status(400).json({
                msg: "Ya existe una lectura principal para este usuario"
            });
        }

        const nuevaLectura = new Lectura({ id, usuario_email: email, tipo, contenido })
        await nuevaLectura.save()
        res.json({ nuevaLectura, msg: "Lectura principal creada correctamente" })

    } catch (error) {
        res.status(400).json({ error })
    }
}

const postLecturaDiaria = async (req, res) => {
    try {
        const { email } = req.params;
        const { id, contenido } = req.body;
        const tipo = 1;

        const pago = await Pago.findOne({ usuario_email: email }).sort({ fecha_pago: -1 });

        if (!pago) {
            return res.json({ estado: "sin pagos" });
        }

        const ahora = new Date();
        const estado = ahora <= pago.fecha_vencimiento ? 1 : 0;
        if (estado === 1) {
           const nuevaLectura = new Lectura({ id, usuario_email: email, tipo, contenido })
        await nuevaLectura.save()
        res.json({ nuevaLectura, msg: "Lectura diaria creada correctamente" })
        } else {
            res.json({ msg: "No se puede crear lectura diaria. Suscripción vencida." })
        }

    } catch (error) {
        res.status(400).json({ error })
    }
}

export { getLectura, getLecturaId, postLecturaPrincipal, postLecturaDiaria }