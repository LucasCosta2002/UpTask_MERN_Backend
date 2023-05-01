import nodemailer from "nodemailer"

export const emailRegistro = async (datos)=>{
    const {email, nombre, token} = datos;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    // informacion del email
    const info = await transport.sendMail({
        from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Confirma tu cuenta",
        text: "Comprueba tu cuenta en UpTask",
        html: `<p>Hola ${nombre}, comprueba tu cuenta en UpTask </p>
        <p>Tu cuenta está casi lista, solo tenés que confirmar tu contraseña en el siguiente enlace: 
        <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Confirmar Cuenta</a></p>
        
        <p>Si no creaste esta cuenta, ignora el mensaje</p>`
    })
}
export const emailOlvidePassword = async (datos)=>{
    const {email, nombre, token} = datos;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    // informacion del email
    const info = await transport.sendMail({
        from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Reestablece tu constraseña",
        text: "Reestablece tu constraseña",
        html: `<p>Hola ${nombre}, has solicitado restablecer tu constraseña de UpTask </p>
        <p>Sigue el siguiente enlace para generar una nueva contraseña: 
        <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer Contraseña</a></p>
        
        <p>Si no solicitaste este cambio, ignora el mensaje</p>`
    })
}
