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
        let transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // --- TEMPLATE HTML "BONITO" ---
        const htmlBody = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #1a237e; padding: 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🔮 Numerología Profesional</h1>
            </div>

            <div style="padding: 30px; background-color: #ffffff; color: #333; line-height: 1.6;">
                <h2 style="color: #1a237e;">¡Hola!</h2>
                <p style="font-size: 16px;">${body}</p>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://www.fcbarcelona.com/en/" target="_blank" style="background-color: #ffc107; color: #000; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px;">Ir a la aplicación</a>
                </div>
            </div>

            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-top: 1px solid #ddd;">
                <p style="font-size: 12px; color: #777; margin: 0;">
                    Este es un correo automático, por favor no respondas. <br>
                    © 2026 Numerología App - San Gil, Santander.
                </p>
            </div>
        </div>
        `;

        let info = await transporter.sendMail({
            from: `"Soporte Numerología" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text: body, // Fallback para clientes que no soportan HTML
            html: htmlBody // El diseño bonito
        });

        console.log("Correo HTML enviado: %s", info.messageId);
    } catch (error) {
        console.error("Error al enviar el correo:", error);
    }
}

export const validarPasswordConfirmacion = (password, { req }) => {
    if (password !== req.body.confirmarPassword) {
        throw new Error('Las contraseñas no coinciden, verifica nuevamente');
    }
    return true;
};
