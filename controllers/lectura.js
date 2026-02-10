import Lectura from "../models/lecturas.js"
import Pago from "../models/pagos.js"
import Usuario from '../models/usuario.js';
import axios from 'axios';
import { response } from 'express';

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


// Función auxiliar para rotar las API Keys y llamar a Gemini
const llamarGemini = async (prompt) => {
    const keys = [
        process.env.API_KEY,
        process.env.API_KEY2,
        process.env.API_KEY3
    ];
    const MODEL = "gemini-2.0-flash";
    let respuesta = null;

    for (const key of keys) {
        if (!key) continue; // Salta si la key no está definida en el .env
        try {
            const contenido = {
                contents: [{
                    role: "user",
                    parts: [{ text: prompt }]
                }]
            };

            const resGemini = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
                contenido,
                { headers: { "Content-Type": "application/json" } }
            );

            respuesta = resGemini.data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (respuesta) break; // Si obtenemos respuesta, salimos del bucle
        } catch (err) {
            console.warn(`⚠️ API Key fallida, intentando con la siguiente...`, err.message);
        }
    }
    return respuesta;
};

const postLecturaPrincipal = async (req, res = response) => {
    try {
        const { email } = req.params;
        const tipo = 0; // Principal

        // 1. Verificar si ya existe una lectura principal
        const existePrincipal = await Lectura.findOne({ usuario_email: email, tipo: 0 });
        if (existePrincipal) {
            return res.status(400).json({ msg: "Ya existe una lectura principal para este usuario" });
        }

        // 2. Obtener datos del usuario para la lectura
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }

        const fechaNac = new Date(usuario.fecha_nacimiento).toLocaleDateString("es-ES", {
            year: "numeric", month: "long", day: "numeric"
        });

        // 3. Generar contenido con Gemini
        const prompt = `Eres un experto en numerología moderna. Analiza la fecha ${fechaNac} y haz una lectura mística, clara y breve.`;
        const contenidoIA = await llamarGemini(prompt);

        if (!contenidoIA) {
            return res.status(500).json({ msg: "No se pudo generar la lectura con la IA" });
        }

        // 4. Guardar en MongoDB
        const nuevaLectura = new Lectura({
            usuario_email: email,
            tipo,
            contenido: contenidoIA,
            fecha_lectura: new Date()
        });

        await nuevaLectura.save();
        res.json({ nuevaLectura, msg: "Lectura principal generada y guardada" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error en el servidor", error });
    }
};

const postLecturaDiaria = async (req, res = response) => {
    try {
        const { email } = req.params;
        const tipo = 1; // Diaria

        // 1. Verificar Pago y Estado
        const pago = await Pago.findOne({ usuario_email: email }).sort({ fecha_pago: -1 });
        if (!pago) {
            return res.status(403).json({ estado: "sin pagos", msg: "Debe realizar un pago para lecturas diarias" });
        }

        const ahora = new Date();
        if (ahora > pago.fecha_vencimiento) {
            return res.status(403).json({ estado: "vencido", msg: "Suscripción vencida" });
        }

        // 2. Verificar si ya tiene la lectura de HOY (evitar duplicados diarios)
        const inicioDia = new Date();
        inicioDia.setHours(0, 0, 0, 0);
        const finDia = new Date();
        finDia.setHours(23, 59, 59, 999);

        const lecturaHoy = await Lectura.findOne({
            usuario_email: email,
            tipo: 1,
            fecha_lectura: { $gte: inicioDia, $lte: finDia }
        });

        if (lecturaHoy) {
            return res.status(400).json({ msg: "Ya generaste tu lectura diaria de hoy" });
        }

        // 3. Obtener fecha de nacimiento
        const usuario = await Usuario.findOne({ email });
        const fechaNac = new Date(usuario.fecha_nacimiento).toLocaleDateString("es-ES", {
            year: "numeric", month: "long", day: "numeric"
        });

        // 4. Generar con Gemini
        const prompt = `Eres un experto en numerología pitagórica diaria. Analiza la energía del día actual según la fecha de nacimiento ${fechaNac}. Menciona el número del día y cómo influye hoy. Tono: inspirador, breve (máximo 4 frases) y místico.`;
        const contenidoIA = await llamarGemini(prompt);

        if (!contenidoIA) {
            return res.status(500).json({ msg: "Error al conectar con la IA" });
        }

        // 5. Guardar
        const nuevaLectura = new Lectura({
            usuario_email: email,
            tipo,
            contenido: contenidoIA,
            fecha_lectura: ahora
        });

        await nuevaLectura.save();
        res.json({ nuevaLectura, msg: "Lectura diaria generada con éxito" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};

export { getLectura, getLecturaId, postLecturaPrincipal, postLecturaDiaria }