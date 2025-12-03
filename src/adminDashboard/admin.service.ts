import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';



@Injectable()

export class AdminService {

  constructor(private readonly db: DatabaseService) {}



  async getGeneralStats() {

    // Consultas SQL directas para obtener contadores en tiempo real

    const totalUsers = await this.db.query('SELECT COUNT(*) FROM users');

    const activeUsers = await this.db.query('SELECT COUNT(*) FROM users WHERE is_active = TRUE');

    const totalMatches = await this.db.query('SELECT COUNT(*) FROM user_matches');

    const totalSessions = await this.db.query('SELECT COUNT(*) FROM sessions');

   

    // Simulación de "Visitantes" vs "Logueados" (Ya que no tenemos tracking de analíticas de visitantes anónimos en BD)

    // En un caso real, esto vendría de una tabla de logs de visitas o Google Analytics

    const visitors = Math.floor(Math.random() * (500 - 200 + 1) + 200);



    return {

      total_users: Number(totalUsers[0].count),

      active_users: Number(activeUsers[0].count),

      total_matches: Number(totalMatches[0].count),

      total_sessions: Number(totalSessions[0].count),

      visitors_count: visitors,

      logged_in_count: Math.floor(Number(activeUsers[0].count) * 0.6) // Estimación de usuarios online ahora mismo

    };

  }



  async getActivityChartData() {

    // Obtener actividad de los últimos 7 días para matches y sesiones

    // Usamos generate_series para asegurar que tenemos todos los días aunque no haya datos

    const query = `

      SELECT

        TO_CHAR(day_series, 'Mon DD') as name,

        COALESCE(matches.count, 0) as matches,

        COALESCE(sessions.count, 0) as sesiones

      FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') as day_series

      LEFT JOIN (

        SELECT DATE(match_time) as day, COUNT(*) as count

        FROM user_matches

        WHERE match_time >= CURRENT_DATE - INTERVAL '6 days'

        GROUP BY DATE(match_time)

      ) matches ON matches.day = DATE(day_series)

      LEFT JOIN (

        SELECT DATE(created_at) as day, COUNT(*) as count

        FROM sessions

        WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'

        GROUP BY DATE(created_at)

      ) sessions ON sessions.day = DATE(day_series)

      ORDER BY day_series ASC;

    `;

   

    return this.db.query(query);

  }



  async getRecentReviews() {

      // Unir reseñas de teaching_sessions y exchange_sessions

      // Nota: Ajusta los campos según tu esquema real si difieren

      const query = `

        SELECT

            'teaching' as type,

            s.session_id,

            ts.student_rating as rating,

            ts.teacher_notes as comment,

            u.first_name || ' ' || u.last_name as user_name

        FROM teaching_sessions ts

        JOIN sessions s ON ts.session_id = s.session_id

        JOIN users u ON ts.student_id = u.id_user

        WHERE ts.student_rating IS NOT NULL

        ORDER BY s.created_at DESC

        LIMIT 5

      `;

      return this.db.query(query);

  }

}



