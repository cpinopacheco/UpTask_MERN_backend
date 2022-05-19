import nodemailer from "nodemailer";

export const emailRegistro = async (datos) => {
  const { email, nombre, token } = datos;

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  //Información del email

  const info = await transport.sendMail({
    from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
    to: email,
    subject: "UpTask - Comprueba tú cuenta",
    text: "Comprueba tu cuenta en UpTask",
    html: `<p>Hola: ${nombre}, Comprueba tú cuenta en UpTask</p>
    <p>Tú cuenta ya está casi lista, solo debes comprobarla en el siguiente enlace:
    
    <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar Cuenta</a>

    <p>Si tú no creaste esta cuenta, puedes ignorar el mensaje</p>
    
    </p>
    `,
  });
};

export const emailOlvidePassword = async (datos) => {
  const { email, nombre, token } = datos;

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  //Información del email

  const info = await transport.sendMail({
    from: '"UpTask - Administrador de PRoyectos" <cuentas@uptask.com>',
    to: email,
    subject: "UpTask - Restablece tú password",
    text: "Restablece tú password",
    html: `<p>Hola: ${nombre}, has solicitado restablecer tú password</p>
    <p>Sigue el siguiente enlace para generar un nuevo password:
    
    <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Restablecer password</a>

    <p>Si tú no solicitaste este email, puedes ignorar el mensaje</p>
    
    </p>
    `,
  });
};
