import { response } from 'express';
import { GoogleGenAI } from "@google/genai"; // La librería nueva que me indicaste
import Lectura from "../models/lecturas.js";
import Pago from "../models/pagos.js";
import Usuario from '../models/usuario.js';

// Función auxiliar para esperar (sleep)
const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- 1. FUNCIÓN OPTIMIZADA CON @google/genai ---
const llamarGemini = async (prompt) => {
    // 1. Array de Keys limpias (sin espacios)
    const keys = [
        process.env.API_KEY?.trim(),
        process.env.API_KEY2?.trim(),
        process.env.API_KEY3?.trim()
    ].filter(k => k);

    // Usamos el modelo estable. Si tienes acceso a la preview, puedes cambiarlo.
    const MODEL_NAME = "gemini-3-flash-preview"; 
    
    let textoRespuesta = null;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        try {
            console.log(`📡 Conectando con Key ${i + 1}...`);
            
            // Inicializamos el cliente con la Key actual
            const ai = new GoogleGenAI({ apiKey: key });

            // Llamada simplificada según tu documentación
            const result = await ai.models.generateContent({
                model: MODEL_NAME,
                contents: prompt, // Le pasamos el prompt directo
            });

            // Extraemos el texto. En la nueva SDK suele ser .text() o la propiedad .text
            textoRespuesta = result.response?.text?.() || result.text;
            
            if (textoRespuesta) break; // ¡Éxito! Salimos del bucle

        } catch (err) {
            console.error(`❌ Falló Key ${i + 1}:`, err.message || err);
            
            // Si es error de cuota (429), esperamos un poco
            if (err.status === 429 || err.message?.includes("429")) {
                console.warn("⏳ Cuota excedida. Esperando 5 segundos...");
                await esperar(5000);
            }
        }
    }
    return textoRespuesta;
};

// --- 2. CONTROLADORES GET ---

const getLectura = async (req, res) => {
    try {
        const { email } = req.params;
        const lecturas = await Lectura.find({ usuario_email: email });
        res.json({ lecturas });
    } catch (error) {
        res.status(400).json({ error });
    }
}

const getLecturaId = async (req, res) => {
    try {
        const { Id } = req.params;
        // OJO: Si usas el campo 'id' manual, asegúrate que exista en el modelo
        const lectura = await Lectura.findOne({ id: Id }); 
        res.json({ lectura });
    } catch (error) {
        res.status(400).json({ error });
    }
}

// --- 3. CONTROLADORES POST ---

const postLecturaPrincipal = async (req, res = response) => {
    try {
        const { email } = req.params;
        const tipo = 0; // Principal

        // 1. Verificar existencia
        const existePrincipal = await Lectura.findOne({ usuario_email: email, tipo: 0 });
        if (existePrincipal) {
            return res.status(400).json({ msg: "Ya existe una lectura principal para este usuario" });
        }

        // 2. Obtener usuario
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }

        // Validación de fecha para evitar errores en el prompt
        const fechaObj = new Date(usuario.fecha_nacimiento);
        if (isNaN(fechaObj.getTime())) {
             return res.status(400).json({ msg: "La fecha de nacimiento del usuario no es válida" });
        }

        const fechaNac = fechaObj.toLocaleDateString("es-ES", {
            year: "numeric", month: "long", day: "numeric"
        });

        // 3. Generar con Gemini
        const prompt = `Eres un experto en numerología moderna. Analiza la fecha ${fechaNac} y haz una lectura mística, clara y breve.`;
        const contenidoIA = await llamarGemini(prompt);

        if (!contenidoIA) {
            return res.status(500).json({ msg: "No se pudo generar la lectura con la IA (Posible error de cuota o modelo)" });
        }

        // 4. Guardar
        const nuevaLectura = new Lectura({
            usuario_email: email,
            tipo,
            contenido: contenidoIA,
            fecha: new Date() // Asegúrate que en tu modelo Lectura.js el campo se llame 'fecha'
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

        // 1. Verificar Pago
        const pago = await Pago.findOne({ usuario_email: email }).sort({ fecha_pago: -1 });
        
        // Si estás probando sin pagos, comenta estas líneas:
        if (!pago) {
            return res.status(403).json({ estado: "sin pagos", msg: "Debe realizar un pago para lecturas diarias" });
        }
        const ahora = new Date();
        if (ahora > pago.fecha_vencimiento) {
            return res.status(403).json({ estado: "vencido", msg: "Suscripción vencida" });
        }

        // 2. Verificar duplicado diario
        const inicioDia = new Date();
        inicioDia.setHours(0, 0, 0, 0);
        const finDia = new Date();
        finDia.setHours(23, 59, 59, 999);

        // Ajusta 'fecha' según tu modelo real
        const lecturaHoy = await Lectura.findOne({
            usuario_email: email,
            tipo: 1,
            fecha: { $gte: inicioDia, $lte: finDia } 
        });

        if (lecturaHoy) {
            return res.status(400).json({ msg: "Ya generaste tu lectura diaria de hoy" });
        }

        // 3. Obtener Usuario
        const usuario = await Usuario.findOne({ email });
        const fechaNac = new Date(usuario.fecha_nacimiento).toLocaleDateString("es-ES", {
            year: "numeric", month: "long", day: "numeric"
        });

        // 4. Generar con Gemini
        const prompt = `Eres un experto en numerología pitagórica diaria. Analiza la energía del día actual según la fecha de nacimiento ${fechaNac}. Menciona el número del día y cómo influye hoy. Tono: inspirador, breve.`;
        const contenidoIA = await llamarGemini(prompt);

        if (!contenidoIA) {
            return res.status(500).json({ msg: "Error al conectar con la IA" });
        }

        // 5. Guardar
        const nuevaLectura = new Lectura({
            usuario_email: email,
            tipo,
            contenido: contenidoIA,
            fecha: ahora
        });

        await nuevaLectura.save();
        res.json({ nuevaLectura, msg: "Lectura diaria generada con éxito" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};

export { getLectura, getLecturaId, postLecturaPrincipal, postLecturaDiaria };