import { response } from "express";
import { GoogleGenAI } from "@google/genai"; // La librería nueva que me indicaste
import Lectura from "../models/lecturas.js";
import Pago from "../models/pagos.js";
import Usuario from "../models/usuario.js";
import { enviarCorreo } from "../helpers/usuario.js";

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const llamarGemini = async (prompt) => {
  const keys = [
    process.env.API_KEY?.trim(),
    process.env.API_KEY2?.trim(),
    process.env.API_KEY3?.trim(),
  ].filter((k) => k);

  const MODEL_NAME = "gemini-3-flash-preview";

  let textoRespuesta = null;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      console.log(`📡 Conectando con Key ${i + 1}...`);

      const ai = new GoogleGenAI({ apiKey: key });

      const result = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });

      textoRespuesta = result.response?.text?.() || result.text;

      if (textoRespuesta) break;
    } catch (err) {
      console.error(`❌ Falló Key ${i + 1}:`, err.message || err);

      if (err.status === 429 || err.message?.includes("429")) {
        console.warn("⏳ Cuota excedida. Esperando 5 segundos...");
        await esperar(5000);
      }
    }
  }
  return textoRespuesta;
};

const getLectura = async (req, res) => {
  try {
    const { email } = req.params;
    const lecturas = await Lectura.find({ usuario_email: email });
    res.json({ lecturas });
  } catch (error) {
    res.status(400).json({ error });
  }
};

const getLecturaId = async (req, res) => {
  try {
    const { id } = req.params;
    const lectura = await Lectura.findOne({ _id: id });
    res.json({ lectura });
  } catch (error) {
    res.status(400).json({ error });
  }
};

const postLecturaPrincipal = async (req, res = response) => {
  try {
    const { email } = req.params;
    const tipo = 0;

    const existePrincipal = await Lectura.findOne({
      usuario_email: email,
      tipo: 0,
    });
    if (existePrincipal) {
      return res
        .status(400)
        .json({ msg: "Ya existe una lectura principal para este usuario" });
    }

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    const fechaObj = new Date(usuario.fecha_nacimiento);
    if (isNaN(fechaObj.getTime())) {
      return res
        .status(400)
        .json({ msg: "La fecha de nacimiento del usuario no es válida" });
    }

    const fechaNac = fechaObj.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const prompt = `Eres un experto en numerología moderna. Analiza la fecha ${fechaNac} y haz una lectura mística, clara y breve.`;
    const contenidoIA = await llamarGemini(prompt);

    if (!contenidoIA) {
      return res
        .status(500)
        .json({
          msg: "No se pudo generar la lectura con la IA (Posible error de cuota o modelo)",
        });
    }

    const nuevaLectura = new Lectura({
      usuario_email: email,
      tipo,
      contenido: contenidoIA,
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
    const tipo = 1;

    const pago = await Pago.findOne({ usuario_email: email }).sort({
      fecha_pago: -1,
    });

    if (!pago) {
      return res
        .status(403)
        .json({
          estado: "sin pagos",
          msg: "Debe realizar un pago para acceder a lecturas diarias",
        });
    }

    const ahora = new Date();

    if (ahora > pago.vencimiento) {
      return res
        .status(403)
        .json({
          estado: "vencido",
          msg: "Tu suscripción ha vencido, por favor renueva tu pago",
        });
    }

    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date();
    finDia.setHours(23, 59, 59, 999);

    const lecturaHoy = await Lectura.findOne({
      usuario_email: email,
      tipo: 1,
      fecha_lectura: { $gte: inicioDia, $lte: finDia },
    });

    if (lecturaHoy) {
      return res.status(400).json({
        msg: "Ya tienes tu mensaje místico del día. Vuelve mañana por una nueva guía.",
        lectura: lecturaHoy,
      });
    }

    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado" });

    const fechaObj = new Date(usuario.fecha_nacimiento);
    if (isNaN(fechaObj.getTime())) {
      return res
        .status(400)
        .json({
          msg: "La fecha de nacimiento del usuario no es válida para numerología",
        });
    }

    const fechaNacString = fechaObj.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const prompt = `Eres un guía espiritual y experto en numerología. Analiza la energía del día de hoy (${ahora.toLocaleDateString()}) para una persona nacida el ${fechaNacString}. Dame un consejo místico breve y poderoso de máximo 3 frases.`;

    const contenidoIA = await llamarGemini(prompt);

    if (!contenidoIA) {
      return res
        .status(500)
        .json({
          msg: "La conexión espiritual (IA) falló. Intenta en un momento.",
        });
    }

    const nuevaLectura = new Lectura({
      usuario_email: email,
      tipo,
      contenido: contenidoIA,
    });

    await nuevaLectura.save();

        enviarCorreo(
          email,
          "Tu energía diaria de hoy",
          `Saludito energicoooo, adivina? se ha generado tu lectura diaria. ve y buscala en la web`
        );

    res.json({
      nuevaLectura,
      msg: "Energía diaria recibida con éxito",
      vence: pago.vencimiento,
    });
  } catch (error) {
    console.error("Error en postLecturaDiaria:", error);
    res
      .status(500)
      .json({ msg: "Error interno del servidor al procesar la lectura" });
  }
};

export { getLectura, getLecturaId, postLecturaPrincipal, postLecturaDiaria };
