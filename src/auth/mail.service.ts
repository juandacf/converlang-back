import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    private transporter;
    private readonly logger = new Logger(MailService.name);

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get<string>('GMAIL_USER'),
                pass: this.configService.get<string>('GMAIL_APP_PASSWORD'),
            },
        });
    }

    async sendPasswordResetEmail(to: string, token: string) {
        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
        const resetLink = `${frontendUrl}/reset-password?token=${token}`;

        const mailOptions = {
            from: `"Equipo Converlang" <${this.configService.get<string>('GMAIL_USER')}>`,
            to,
            subject: 'Recuperación de Contraseña - Converlang',
            html: `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 8px; max-width: 500px; margin: auto;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #4CAF50;">Recuperación de Contraseña</h2>
          </div>
          <p style="color: #333; font-size: 16px;">Hola,</p>
          <p style="color: #333; font-size: 16px; line-height: 1.5;">Has solicitado restablecer tu contraseña en Converlang. Haz clic en el siguiente enlace para crear una nueva:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center; margin-bottom: 5px;">Este enlace es completamente seguro y expirará en <strong>exactamente 15 minutos</strong>.</p>
          <p style="color: #999; font-size: 12px; text-align: center;">Si no solicitaste un restablecimiento de contraseña, por favor ignora este correo.</p>
        </div>
      `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Correo de recuperación enviado exitosamente a: ${to}`);
        } catch (error) {
            this.logger.error(`Error enviando correo a ${to}: ${error.message}`);
            throw new Error('Error enviando el correo de recuperación. Revisa tus credenciales.');
        }
    }
}
