import nodemailer from 'nodemailer'; //

export const esFechaValida = (value) => {
    const fechaEntrada = new Date(value);
    const ahora = new Date();

    if (fechaEntrada > ahora) {
        throw new Error("La fecha no puede ser mayor a la actual");
    }
    
    return true;
};

export const rolValido = (value) => {
    switch (Number(value)) {
        case 1:
            return "admin";
        case 0:
            return "user";
        default:
            throw new Error("Rol inválido");
    }
};

export const enviarCorreo = async function enviarCorreo(to, subject, body) {
    try {
        // Configurar el transporte SMTP
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // true para puerto 465, false para otros
            auth: {
                user: process.env.EMAIL_USER, // tu correo
                pass: process.env.EMAIL_PASS  // tu contraseña o App Password
            }
        });

        // Configurar el mensaje
        let info = await transporter.sendMail({
            from: `"Soporte" <${process.env.EMAIL_USER}>`, // remitente
            to, // destinatario
            subject, // asunto
            text: body,
        });

        console.log("Correo enviado: %s", info.messageId);
    } catch (error) {
        console.error("Error al enviar el correo:", error);
    }
}

