import { transporter } from '../config/nodemailer';

interface IEmail {
  email:string;
  name:string;
  token:string;
}

export class AuthEmail {
  static sendConfirmationEmail = async ({ email, name, token }: IEmail ) : Promise<void> => {
    try {
      const info = await transporter.sendMail({
        from: 'Snippet <snippet@snippet.com>',
        to: email,
        subject: 'Snippet - Confirmación de Cuenta',
        text: 'Snippet - confirma tu cuenta',
        html: `
        <h1>Snippet - Confirmación de Cuenta</h1>
        <p>Hola ${name}, por favor, confirma tu cuenta en Snippet con el siguiente enlace: <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar Cuenta</a></p>
        <p>Eh ingresa el Token: <b>${token}</b></p>
        <p>Si no solicitaste esta confirmación, por favor, ignora este correo.</p>
        <p>EL token expira en 120 minutos</p>
        <p>Gracias por usar Snippet</p>
        `
      })
    } catch (error) {
      console.log(error)
    }
  };

  static sendPasswordResetToken = async ({email, name, token}: IEmail) : Promise<void> => {
    const info = await transporter.sendMail({
      from: 'Snippet <snippet@snippet.com>',
      to: email,
      subject: 'Snippet - Restablece tu Password',
      text: 'Snippet - Restablece tu Password',
      html: `
      <h1>Snippet - Restablece tu Password</h1>
      <p>Hola ${name}, por favor, restablece tu password en Snippet con el siguiente enlace: <a href="${process.env.FRONTEND_URL}/auth/forgot-password">Restablecer Password</a></p>
      <p>Eh ingresa el Token: <b>${token}</b></p>
      <p>Si no solicitaste esta confirmación, por favor, ignora este correo.</p>
      <p>EL token expira en 120 minutos</p>
      <p>Gracias por usar Snippet</p>
      `
    })
  }
}