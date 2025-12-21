import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { UpdateUserPreferencesDto } from './DTO/update-user-preferences.dto';

@Injectable()
export class PreferencesService {
  constructor(private readonly db: DatabaseService) {}


  async getByUserId(userId: number) {
    const  rows  = await this.db.query(
      `
        SELECT *
        FROM get_user_preferences($1::INTEGER)
      `,
      [userId],
    );

    return rows[0]; // siempre debe existir por el trigger
  }


  async update(userId: number, dto: UpdateUserPreferencesDto) {
    const { theme, languageCode } = dto;

    const  rows = await this.db.query(
      `
        SELECT update_user_preferences(
          $1::INTEGER,
          $2::BOOLEAN,
          $3::VARCHAR
        ) AS message
      `,
      [
        userId,
        theme ?? null,
        languageCode ?? null,
      ],
    );

    return rows[0];
  }
}
