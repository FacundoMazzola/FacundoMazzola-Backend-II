import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

export const sendRecoveryEmail = async (to, token) => {

    const link = `http://localhost:8080/reset-password?token=${token}`;

    await transporter.sendMail({
        from: process.env.MAIL_USER,
        to,
        subject: "Recuperación de contraseña",
        html: `
            <h2>Recuperación de contraseña</h2>
            <p>Hacé click en el botón para restablecer tu contraseña:</p>
            <a href="${link}">
                <button>Restablecer contraseña</button>
            </a>
            <p>Este enlace expira en 1 hora.</p>
        `
    });
};