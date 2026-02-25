import { Injectable, UnauthorizedException, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { User } from 'src/users/DTO/user.type';
import { UserValidation } from 'src/users/DTO/user-validation.type';
import { MailService } from './mail.service';
import { randomBytes } from 'crypto';

/**
 * AuthService — Autenticación + Seguimiento de usuarios en línea
 *
 * SISTEMA DE HEARTBEAT:
 * ────────────────────
 * onlineUsers (Map<number, number>)
 *   - key:   userId  (identificador único del usuario)
 *   - value: timestamp en ms (Date.now()) del último heartbeat recibido
 *
 * FLUJO:
 * 1. El frontend envía POST /auth/heartbeat cada 60 segundos con su JWT.
 * 2. registerHeartbeat() guarda/actualiza la entrada en el Map.
 *    → Si el usuario ya existe, simplemente sobrescribe el timestamp.
 *    → Si abre 5 pestañas, sigue siendo 1 sola entrada (misma key).
 * 3. getOnlineUsersCount() recorre el Map y cuenta las entradas
 *    cuyo timestamp es menor a HEARTBEAT_TTL_MS (2 minutos).
 * 4. El background worker (cleanupStaleHeartbeats) corre cada 60s
 *    y ELIMINA las entradas con timestamp mayor a HEARTBEAT_TTL_MS,
 *    para que la memoria no crezca indefinidamente.
 *
 * LIFECYCLE:
 * - onModuleInit():    Arranca el worker de limpieza (setInterval)
 * - onModuleDestroy(): Detiene el worker (clearInterval)
 */
@Injectable()
export class AuthService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AuthService.name);

  // ── Heartbeat Storage ──
  // Map<userId, timestampMs> — almacena el último heartbeat de cada usuario
  private readonly onlineUsers = new Map<number, number>();

  // Tiempo de vida de un heartbeat: 2 minutos (120,000 ms)
  // Si un usuario no envía heartbeat en este tiempo, se considera offline
  private readonly HEARTBEAT_TTL_MS = 2 * 60 * 1000;

  // Intervalo del worker de limpieza: cada 60 segundos
  private readonly CLEANUP_INTERVAL_MS = 60 * 1000;

  // Referencia al setInterval para poder detenerlo en onModuleDestroy
  private cleanupTimer: NodeJS.Timeout;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) { }

  // ── Lifecycle Hooks ──

  /**
   * Se ejecuta cuando NestJS termina de inicializar este módulo.
   * Arranca el worker de limpieza que corre cada 60 segundos.
   */
  onModuleInit() {
    this.cleanupTimer = setInterval(() => {
      this.cleanupStaleHeartbeats();
    }, this.CLEANUP_INTERVAL_MS);

    this.logger.log('🫀 Heartbeat worker iniciado — limpieza cada 60s');
  }

  /**
   * Se ejecuta cuando NestJS se apaga (Ctrl+C, deploy, etc.).
   * Detiene el worker para evitar memory leaks en el proceso de Node.
   */
  onModuleDestroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.logger.log('🛑 Heartbeat worker detenido');
    }
  }

  // ── Heartbeat Methods ──

  /**
   * Registra un heartbeat para el usuario dado.
   * Se llama desde POST /auth/heartbeat.
   *
   * @param userId - ID del usuario (extraído del JWT)
   *
   * Como el Map usa userId como key, si el usuario ya tiene
   * un heartbeat previo, simplemente se sobrescribe con el
   * timestamp más reciente → nunca hay duplicados.
   */
  registerHeartbeat(userId: number): void {
    this.onlineUsers.set(userId, Date.now());
  }

  /**
   * Retorna cuántos usuarios tienen un heartbeat activo (< 2 min).
   * Se llama desde AdminService.getStats() para la card "Logueados".
   *
   * Recorre todo el Map y cuenta solo las entradas cuyo timestamp
   * está dentro del TTL. Esto es O(n) donde n = usuarios online,
   * que en la práctica es un número muy bajo.
   */
  getOnlineUsersCount(): number {
    const now = Date.now();
    let count = 0;

    for (const [, timestamp] of this.onlineUsers) {
      if (now - timestamp < this.HEARTBEAT_TTL_MS) {
        count++;
      }
    }

    return count;
  }

  /**
   * BACKGROUND WORKER — Elimina entradas viejas del Map.
   *
   * Se ejecuta cada 60 segundos vía setInterval.
   * Recorre el Map y borra las entradas cuyo timestamp
   * superó el HEARTBEAT_TTL_MS (2 min).
   *
   * Sin este worker, si un usuario cierra el navegador sin logout,
   * su entrada quedaría en el Map para siempre → memory leak.
   */
  private cleanupStaleHeartbeats(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [userId, timestamp] of this.onlineUsers) {
      if (now - timestamp >= this.HEARTBEAT_TTL_MS) {
        this.onlineUsers.delete(userId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.log(`🧹 Heartbeat cleanup: ${cleaned} entradas eliminadas, ${this.onlineUsers.size} usuarios online`);
    }
  }

  // ── Auth Methods (existentes) ──

  async validateUser(email: string, pass: string) {
    const user: UserValidation | null = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(pass, user.password_hash);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    // Validar que el usuario esté activo (maneja tanto boolean como string de PostgreSQL)
    if (user.is_active === false || user.is_active === 'f' || user.is_active === 'false' || user.is_active === 0) {
      throw new UnauthorizedException('ACCOUNT_INACTIVE: Your account has been deactivated. Please contact converlang@gmail.com for more information.');
    }

    const { password_hash, ...result } = user;
    return result;
  }

  async login(user: User) {
    const payload = { sub: user.id_user, email: user.email, roles: [user.role_code], };

    // Registrar heartbeat inmediatamente al hacer login
    this.registerHeartbeat(user.id_user);

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // ── Funciones de Recuperación de Contraseña ──

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Respondemos positivamente siempre para evitar ataques de enumeración (saber qué correos existen)
      return { message: 'Si el correo está registrado en nuestro sistema, hemos enviado las instrucciones para restablecer tu contraseña.' };
    }

    // Generar token criptográficamente seguro
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Expiración exacta en 15 minutos

    // Guardar token en BD
    await this.usersService.createPasswordReset(user.id_user, token, expiresAt);

    // Enviar el correo
    await this.mailService.sendPasswordResetEmail(user.email, token);

    return { message: 'Si el correo está registrado en nuestro sistema, hemos enviado las instrucciones para restablecer tu contraseña.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetRecord = await this.usersService.getPasswordResetByToken(token);

    if (!resetRecord) {
      throw new UnauthorizedException('Token inválido o expirado.');
    }

    const now = new Date();
    // Comparar fecha de expiración
    if (new Date(resetRecord.expires_at) < now) {
      // Eliminar el token porque ya expiró
      await this.usersService.deletePasswordResetByUserId(resetRecord.id_user);
      throw new UnauthorizedException('El token ha expirado. Por favor solicita uno nuevo.');
    }

    // Hashear nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Guardar en la BD
    await this.usersService.updatePassword(resetRecord.id_user, passwordHash);

    // Invalidar token eliminándolo
    await this.usersService.deletePasswordResetByUserId(resetRecord.id_user);

    return { message: 'Contraseña actualizada exitosamente.' };
  }
}
