import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const user = this.configService.get<string>('MAIL_USER') || '';
    const pass = this.configService.get<string>('MAIL_PASSWORD') || '';

    this.transporter = createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
    });
  }

  async sendWelcomeEmail(user: { email: string; id: number }) {
    const mailOptions = {
      from: `Jamby <${this.configService.get<string>('MAIL_USER') || 'no-reply@example.com'}>`,
      to: user.email,
      subject: 'Bienvenido a Jamby',
      html: `
        <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
          <h1 style="color: #111827;">¡Bienvenido a Jamby!</h1>
          <p>Hola <strong>${user.email}</strong>,</p>
          <p>Tu cuenta fue creada satisfactoriamente en <strong>Jamby</strong>.</p>
          <p>ID de usuario: <strong>${user.id}</strong></p>
          <p>Ya puedes comenzar a explorar productos, agregar artículos al carrito y completar tu primer pedido.</p>
          <div style="margin-top: 24px; padding: 16px; background: #f8fafc; border-radius: 12px;">
            <p style="margin: 0; color: #4b5563;">Gracias por unirte a nuestra tienda.</p>
          </div>
        </div>
      `,
      text: `Bienvenido a Jamby! Tu cuenta fue creada con el email ${user.email} (ID: ${user.id}).`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
