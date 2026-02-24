import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserAdminDto } from './DTO/create-user-admin.dto';
import { UpdateUserAdminDto } from './DTO/update-user-admin.dto';
import { ChangePasswordDto } from './DTO/change-password.dto';
import * as bcrypt from 'bcrypt';

/**
 * Servicio de administración para gestionar usuarios y estadísticas del dashboard
 * Utiliza las funciones de base de datos definidas en users.sql
 */
@Injectable()
export class AdminService {
  constructor(
    private readonly db: DatabaseService,
    private readonly authService: AuthService,
  ) { }

  /**
   * Sanitiza strings para prevenir inyección SQL y XSS
   * Elimina caracteres peligrosos y patrones de inyección
   */
  private sanitizeInput(value: string): string {
    if (!value || typeof value !== 'string') return value;
    return value
      .replace(/[\x00-\x1f]/g, '') // caracteres de control
      .replace(/['"`;\\]/g, '')     // caracteres peligrosos SQL
      .replace(/<[^>]*>/g, '')      // tags HTML/XSS
      .replace(/(--|\/\*|\*\/|xp_|exec|drop|insert|delete|update|union|select)/gi, '') // patrones SQL
      .trim();
  }

  // ========================================
  // CRUD DE USUARIOS
  // ========================================

  /**
   * Crear un nuevo usuario desde el panel de administración
   * Utiliza la función de BD: fun_insert_usuarios
   * @param dto - Datos del usuario a crear
   * @returns Usuario creado
   */
  async createUser(dto: CreateUserAdminDto) {
    try {
      // Hash del password
      const passwordHash = await bcrypt.hash(dto.password, 10);

      // Llamar a la función de BD fun_insert_usuarios
      const query = `
        SELECT * FROM fun_insert_usuarios(
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        )
      `;

      const params = [
        this.sanitizeInput(dto.first_name),
        this.sanitizeInput(dto.last_name),
        dto.email.toLowerCase().trim(),
        passwordHash,
        dto.gender_id,
        dto.birth_date,
        dto.country_id.toUpperCase(),
        dto.profile_photo ? this.sanitizeInput(dto.profile_photo) : null,
        dto.native_lang_id.toUpperCase(),
        dto.target_lang_id.toUpperCase(),
        dto.match_quantity || 10,
        dto.description ? this.sanitizeInput(dto.description) : 'NO APLICA',
        dto.role_code.toLowerCase()
      ];

      const result = await this.db.query(query, params);

      if (result && result[0]) {
        // Registrar en auditoría
        await this.logAudit('users', result[0].id_user.toString(), 'INSERT', 'Usuario creado desde admin dashboard');

        // No retornar el password_hash
        const { password_hash, ...userWithoutPassword } = result[0];
        return userWithoutPassword;
      }

      throw new BadRequestException('No se pudo crear el usuario');
    } catch (error) {
      // Las validaciones de la función de BD lanzan excepciones con mensajes descriptivos
      throw new BadRequestException(error.message || 'Error al crear usuario');
    }
  }

  /**
   * Actualizar un usuario existente
   * Utiliza la función de BD: update_user
   * @param userId - ID del usuario a actualizar
   * @param dto - Datos a actualizar
   * @returns Mensaje de confirmación
   */
  async updateUser(userId: number, dto: UpdateUserAdminDto) {
    try {
      // Usar UPDATE directo en lugar de la función almacenada para evitar problemas de firmas
      // y asegurar que todos los campos (incluyendo bank_id) se actualicen correctamente
      const query = `
        UPDATE users SET
          first_name = $2,
          last_name = $3,
          email = $4,
          gender_id = $5,
          birth_date = $6,
          country_id = $7,
          profile_photo = COALESCE($8, profile_photo),
          native_lang_id = $9,
          target_lang_id = $10,
          match_quantity = $11,
          description = $12,
          updated_at = NOW()
        WHERE id_user = $1
        RETURNING id_user, first_name, last_name, email
      `;

      const params = [
        userId,
        this.sanitizeInput(dto.first_name),
        this.sanitizeInput(dto.last_name),
        dto.email.toLowerCase().trim(),
        dto.gender_id || null,
        dto.birth_date,
        dto.country_id.toUpperCase(),
        dto.profile_photo ? this.sanitizeInput(dto.profile_photo) : null,
        dto.native_lang_id.toUpperCase(),
        dto.target_lang_id.toUpperCase(),
        dto.match_quantity,
        dto.description ? this.sanitizeInput(dto.description) : 'NO APLICA'
      ];

      const result = await this.db.query(query, params);

      if (result && result[0]) {
        // Registrar en auditoría
        await this.logAudit('users', userId.toString(), 'UPDATE', 'Usuario actualizado desde admin dashboard');

        return {
          message: 'Usuario actualizado correctamente',
          userId: userId,
          user: result[0]
        };
      }

      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating user:', error);
      throw new BadRequestException(error.message || 'Error al actualizar usuario');
    }
  }

  /**
   * Inactivar un usuario (soft delete)
   * Utiliza la función de BD: delete_user
   * @param userId - ID del usuario a inactivar
   * @returns Mensaje de confirmación
   */
  async inactivateUser(userId: number) {
    try {
      // Llamar a la función de BD delete_user (soft delete)
      const query = `SELECT delete_user($1)`;
      const result = await this.db.query(query, [userId]);

      if (result && result[0]) {
        // Registrar en auditoría
        await this.logAudit('users', userId.toString(), 'UPDATE', 'Usuario inactivado desde admin dashboard');

        return {
          message: result[0].delete_user,
          userId: userId
        };
      }

      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Error al inactivar usuario');
    }
  }

  /**
   * Cambiar contraseña de usuario
   * Utiliza la función de BD: update_user_password
   * @param userId - ID del usuario
   * @param dto - DTO con la nueva contraseña
   * @returns Mensaje de confirmación
   */
  async changePassword(userId: number, dto: ChangePasswordDto) {
    try {
      // Hash del password
      const passwordHash = await bcrypt.hash(dto.password, 10);

      // Llamar a la función de BD update_user_password
      const query = `SELECT update_user_password($1, $2)`;
      const result = await this.db.query(query, [userId, passwordHash]);

      if (result && result[0]) {
        // Registrar en auditoría
        await this.logAudit('users', userId.toString(), 'UPDATE', 'Contraseña actualizada desde admin dashboard');

        return {
          message: result[0].update_user_password,
          userId: userId
        };
      }

      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Error al cambiar contraseña');
    }
  }

  /**
   * Reactivar un usuario inactivo
   * Actualiza is_active a true y reinicia el contador de reportes
   * @param userId - ID del usuario a reactivar
   * @returns Mensaje de confirmación
   */
  async activateUser(userId: number) {
    try {
      // Actualizar is_active a true Y reiniciar contador de reportes a 0
      const query = `UPDATE users SET is_active = true, report_quantity = 0 WHERE id_user = $1 RETURNING id_user, first_name, last_name, email`;
      const result = await this.db.query(query, [userId]);

      if (result && result[0]) {
        // Registrar en auditoría
        await this.logAudit('users', userId.toString(), 'UPDATE', 'Usuario reactivado desde admin dashboard - contador de reportes reiniciado');

        return {
          message: `Usuario ${result[0].first_name} ${result[0].last_name} reactivado exitosamente. Contador de reportes reiniciado.`,
          userId: userId,
          user: result[0]
        };
      }

      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Error al reactivar usuario');
    }
  }

  /**
   * Obtener todos los usuarios
   * Utiliza la función de BD: get_all_users
   * @param includeInactive - Incluir usuarios inactivos (default: false)
   * @returns Lista de usuarios
   */
  async getAllUsers(includeInactive: boolean = false) {
    try {
      const query = `SELECT * FROM get_all_users($1)`;
      const result = await this.db.query(query, [includeInactive]);
      return result;
    } catch (error) {
      throw new BadRequestException('Error al obtener usuarios');
    }
  }

  /**
   * Obtener un usuario por ID
   * Utiliza la función de BD: get_user_by_id
   * @param userId - ID del usuario
   * @returns Información del usuario
   */
  async getUserById(userId: number) {
    try {
      const query = `SELECT * FROM get_user_by_id($1)`;
      const result = await this.db.query(query, [userId]);

      if (result && result[0]) {
        // No retornar el password_hash si existe
        const { password_hash, ...userWithoutPassword } = result[0];
        return userWithoutPassword;
      }

      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener usuario');
    }
  }

  // ========================================
  // ESTADÍSTICAS Y REPORTES
  // ========================================

  /**
   * Obtener estadísticas generales del dashboard
   * @returns Estadísticas de usuarios, matches y sesiones
   */
  /**
   * Obtener estadísticas generales del dashboard
   * @returns Estadísticas de usuarios, matches y sesiones
   */
  async getStats() {
    const queries = [
      `SELECT COUNT(id_user)::int as count FROM users`,
      `SELECT COUNT(id_user)::int as count FROM users WHERE is_active = true`,
      `SELECT COUNT(match_id)::int as count FROM user_matches`,
      `SELECT COUNT(session_id)::int as count FROM sessions WHERE end_time IS NOT NULL`,
      `SELECT COUNT(message_id)::int as count FROM chat_logs WHERE timestamp::date = CURRENT_DATE`
    ];

    const results = await Promise.all(queries.map(q => this.db.query(q)));

    const [totalUsers, activeUsers, totalMatches, completedSessions, todayMessages] = results;

    return {
      total_users: totalUsers[0].count,
      active_users: activeUsers[0].count,
      total_matches: totalMatches[0].count,
      total_sessions: completedSessions[0].count,
      messages_today: todayMessages[0].count,
      logged_in_count: this.authService.getOnlineUsersCount(),
      growth_users: 12,
      growth_active: 8,
      sessions_breakdown: {
        teaching: 0,
        exchange: 0
      }
    };
  }

  /**
   * Obtener actividad semanal (matches y sesiones)
   * @returns Actividad de los últimos 7 días
   */
  async getActivity() {
    const query = `
      WITH last_days AS (
          SELECT generate_series(
              CURRENT_DATE - INTERVAL '6 days',
              CURRENT_DATE,
              '1 day'::interval
          )::date AS day
      )
      SELECT 
          TO_CHAR(ld.day, 'Dy') as name,
          (SELECT COUNT(m.match_id)::int FROM user_matches m WHERE m.match_time::date = ld.day) as matches,
          (SELECT COUNT(s.session_id)::int FROM sessions s WHERE s.start_time::date = ld.day) as sesiones
      FROM last_days ld
      ORDER BY ld.day ASC;
    `;

    const result = await this.db.query(query);
    return result;
  }

  /**
   * Obtener crecimiento de usuarios (nuevos registros por día)
   * @returns Nuevos usuarios de los últimos 7 días
   */
  async getUserGrowth() {
    const query = `
      WITH last_days AS (
          SELECT generate_series(
              CURRENT_DATE - INTERVAL '6 days',
              CURRENT_DATE,
              '1 day'::interval
          )::date AS day
      )
      SELECT 
          TO_CHAR(ld.day, 'Dy') as name,
          (SELECT COUNT(u.id_user)::int FROM users u WHERE u.created_at::date = ld.day) as nuevos_usuarios
      FROM last_days ld
      ORDER BY ld.day ASC;
    `;

    const result = await this.db.query(query);
    return result;
  }

  /**
   * Obtener distribución de usuarios por rol y estado
   * @returns array [{ name, value, color }]
   */
  async getUserDistribution() {
    const queries = [
      // 1. Usuarios Activos (Rol user + is_active = true)
      `SELECT COUNT(id_user)::int as count FROM users WHERE role_code = 'user' AND is_active = true`,
      // 2. Usuarios Inactivos (Cualquier rol + is_active = false)
      `SELECT COUNT(id_user)::int as count FROM users WHERE is_active = false`,
      // 3. Administradores (Rol admin)
      `SELECT COUNT(id_user)::int as count FROM users WHERE role_code = 'admin'`
    ];

    const results = await Promise.all(queries.map(q => this.db.query(q)));

    return [
      { name: 'Usuarios Activos', value: results[0][0].count, color: '#107C10' },
      { name: 'Usuarios Inactivos', value: results[1][0].count, color: '#D13438' },
      { name: 'Administradores', value: results[2][0].count, color: '#8764B8' }
    ];
  }

  /**
   * Obtener lista de usuarios con filtro por rol
   * @param role - Rol a filtrar (opcional)
   * @returns Lista de usuarios
   * @deprecated Usar getAllUsers() en su lugar
   */
  async getUsers(role?: string) {
    let query = `
      SELECT 
        u.id_user, 
        u.first_name, 
        u.last_name, 
        u.email, 
        u.role_code,
        r.role_name,
        u.country_id,
        c.country_name,
        u.is_active, 
        u.last_login 
      FROM users u
      LEFT JOIN countries c ON u.country_id = c.country_code
      LEFT JOIN user_roles r ON u.role_code = r.role_code
    `;

    const params: any[] = [];

    if (role && role !== 'all') {
      query += ` WHERE u.role_code = $1`;
      params.push(role);
    }

    query += ` ORDER BY u.created_at DESC LIMIT 100`;

    const result = await this.db.query(query, params);
    return result;
  }

  /**
   * Obtener reseñas recientes de sesiones completadas
   * @returns Últimas 6 reseñas
   */
  async getRecentReviews() {
    // Tablas teaching_sessions y exchange_sessions no están en uso
    // Retornamos array vacío hasta que se implemente el sistema de reseñas
    return [];
  }

  /**
   * Obtener métricas clave del dashboard
   * @returns Métricas calculadas con tendencias
   */
  async getMetrics() {
    try {
      // 1. Total Matches: Cantidad total de matches en la plataforma
      const matchesQuery = `
        SELECT COUNT(match_id)::int as total_matches
        FROM user_matches;
      `;

      // 2. Usuarios Online: Usuarios conectados en este momento
      const onlineCount = this.authService.getOnlineUsersCount();

      // 3. Sesiones Completadas: Total de sesiones finalizadas
      const sessionsQuery = `
        SELECT COUNT(session_id)::int as current_count
        FROM sessions
        WHERE end_time IS NOT NULL;
      `;

      // 4. Tiempo Promedio: Duración promedio de las sesiones en minutos
      const avgTimeQuery = `
        SELECT 
          COALESCE(EXTRACT(EPOCH FROM AVG(end_time - start_time)) / 60, 0)::numeric(10,1) as current_avg
        FROM sessions
        WHERE end_time IS NOT NULL;
      `;

      // Ejecutar consultas en paralelo
      const [matchesResult, sessionsResult, avgTimeResult] = await Promise.all([
        this.db.query(matchesQuery),
        this.db.query(sessionsQuery),
        this.db.query(avgTimeQuery)
      ]);

      const matchesData = matchesResult[0] || { total_matches: 0 };
      const sessionsData = sessionsResult[0] || { current_count: 0 };
      const avgTimeData = avgTimeResult[0] || { current_avg: '0.0' };

      // Formatear tiempo promedio
      const formatTime = (minutes: number): string => {
        if (minutes < 60) return `${Math.round(minutes)}min`;
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
      };

      return {
        total_matches: {
          label: 'Total Matches',
          description: 'Conexiones totales entre usuarios',
          value: matchesData.total_matches,
          color: 'text-green-600'
        },
        online_users: {
          label: 'Usuarios Online',
          description: 'Conectados en este momento',
          value: onlineCount,
          color: 'text-blue-600'
        },
        completed_sessions: {
          label: 'Sesiones Completadas',
          description: 'Videollamadas finalizadas',
          value: sessionsData.current_count,
          color: 'text-purple-600'
        },
        average_time: {
          label: 'Tiempo Promedio por Llamada',
          description: 'Duración media de cada videollamada',
          value: formatTime(parseFloat(avgTimeData.current_avg.toString())),
          color: 'text-orange-600'
        }
      };
    } catch (error) {
      console.error('Error calculating metrics:', error);
      return {
        total_matches: {
          label: 'Total Matches',
          description: 'Conexiones totales entre usuarios',
          value: 0,
          color: 'text-green-600'
        },
        online_users: {
          label: 'Usuarios Online',
          description: 'Conectados en este momento',
          value: 0,
          color: 'text-blue-600'
        },
        completed_sessions: {
          label: 'Sesiones Completadas',
          description: 'Videollamadas finalizadas',
          value: 0,
          color: 'text-purple-600'
        },
        average_time: {
          label: 'Tiempo Promedio por Llamada',
          description: 'Duración media de cada videollamada',
          value: '0min',
          color: 'text-orange-600'
        }
      };
    }
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  /**
   * Registrar acción en la tabla de auditoría
   * @param table - Nombre de la tabla
   * @param recordId - ID del registro afectado
   * @param action - Acción realizada (CREATE, UPDATE, DELETE, etc.)
   * @param notes - Notas adicionales
   */
  private async logAudit(table: string, recordId: string, action: string, notes: string) {
    const auditId = `AUD_${Date.now()}`;
    try {
      await this.db.query(
        `INSERT INTO audit_logs (audit_id, table_name, record_id, action, new_values) VALUES ($1, $2, $3, $4, $5)`,
        [auditId, table, recordId, action, JSON.stringify({ notes })]
      );
    } catch (e) {
      console.error('Error logging audit:', e);
    }
  }
}
