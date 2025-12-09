import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly db: DatabaseService,
  ) {}

  // 1. Estadísticas Generales
  async getStats() {
    const queries = [
      `SELECT COUNT(*)::int as count FROM users`,
      `SELECT COUNT(*)::int as count FROM users WHERE is_active = true`,
      `SELECT COUNT(*)::int as count FROM user_matches`,
      `SELECT COUNT(*)::int as count FROM sessions WHERE session_status = 'completed'`,
      `SELECT COUNT(*)::int as count FROM sessions WHERE session_type = 'teaching'`,
      `SELECT COUNT(*)::int as count FROM sessions WHERE session_type = 'exchange'`
    ];

    // Tu servicio ya devuelve el array de filas directamente
    const results = await Promise.all(queries.map(q => this.db.query(q)));

    const [totalUsers, activeUsers, totalMatches, completedSessions, teachingCount, exchangeCount] = results;

    // CORRECCIÓN: Accedemos directo al índice 0, porque 'totalUsers' ya es el array de filas
    return {
      total_users: totalUsers[0].count,
      active_users: activeUsers[0].count,
      total_matches: totalMatches[0].count,
      total_sessions: completedSessions[0].count,
      visitors_count: Math.floor(totalUsers[0].count * 1.5), 
      logged_in_count: Math.floor(activeUsers[0].count * 0.3),
      growth_users: 12,
      growth_active: 8,
      sessions_breakdown: {
        teaching: teachingCount[0].count,
        exchange: exchangeCount[0].count
      }
    };
  }

  // 2. Actividad Semanal
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
          (SELECT COUNT(*)::int FROM user_matches m WHERE m.match_time::date = ld.day) as matches,
          (SELECT COUNT(*)::int FROM sessions s WHERE s.start_time::date = ld.day) as sesiones
      FROM last_days ld
      ORDER BY ld.day ASC;
    `;

    // CORRECCIÓN: Devolvemos result directo, ya es el array
    const result = await this.db.query(query);
    return result; 
  }

  // 3. Lista de Usuarios
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
    return result; // CORRECCIÓN: Sin .rows
  }

  // 4. Toggle Estado
  async toggleUserStatus(userId: number, isActive: boolean) {
    const query = `
      UPDATE users 
      SET is_active = $1, updated_at = NOW() 
      WHERE id_user = $2 
      RETURNING id_user, is_active, email
    `;
    const result = await this.db.query(query, [isActive, userId]);
    
    // result es un array de filas. result[0] es la primera fila.
    if (result[0]) {
       const action = isActive ? 'ACTIVATED' : 'DEACTIVATED';
       await this.logAudit('users', userId.toString(), 'UPDATE', `User ${action}`);
    }

    return result[0]; // CORRECCIÓN
  }

  // 5. Inactivar Usuario (Soft Delete)
  async deleteUser(userId: number) {
    const query = `
      UPDATE users 
      SET is_active = false, updated_at = NOW() 
      WHERE id_user = $1 
      RETURNING id_user, is_active
    `;
    const result = await this.db.query(query, [userId]);
    
    await this.logAudit('users', userId.toString(), 'SOFT_DELETE', 'User inactivated via delete action');
    
    return result[0]; // CORRECCIÓN
  }

  // 6. Reseñas Recientes
  async getRecentReviews() {
    const query = `
      SELECT 
        s.session_id,
        u.first_name || ' ' || u.last_name as user_name,
        COALESCE(ts.student_rating, es.session_rating_user1) as rating,
        COALESCE(ts.teacher_notes, es.feedback_user1) as comment,
        s.session_type
      FROM sessions s
      JOIN users u ON s.id_user1 = u.id_user 
      LEFT JOIN teaching_sessions ts ON s.session_id = ts.session_id
      LEFT JOIN exchange_sessions es ON s.session_id = es.session_id
      WHERE s.session_status = 'completed' 
        AND (ts.student_rating IS NOT NULL OR es.session_rating_user1 IS NOT NULL)
      ORDER BY s.end_time DESC
      LIMIT 6
    `;
    const result = await this.db.query(query);
    return result; // CORRECCIÓN: Sin .rows
  }

  // Helper Auditoría
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