import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateExchangeSessionDto } from './DTO/exchange-sessions.dto';

@Injectable()
export class CallService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateExchangeSessionDto) {
    const {
      idUser1,
      idUser2,
      startTime,
      endTime,
      sessionNotes,
    } = dto;

    const  rows  = await this.db.query(
      `
        SELECT add_session(
          $1, -- id_user1
          $2, -- id_user2
          $3, -- start_time
          $4, -- end_time
          $5  -- session_notes
        ) AS message
      `,
      [
        idUser1,
        idUser2,
        startTime,
        endTime,
        sessionNotes ?? null,
      ],
    );

    return rows[0];
  }

async getLastMonthCalls (user_id: number){

    const result = await this.db.query('SELECT get_user_sessions_last_month($1);', [user_id])

    return result[0].get_user_sessions_last_month
  }
}
