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
}
