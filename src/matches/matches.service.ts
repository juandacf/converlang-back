import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { createLikeDto } from './DTO/create-like.dto';
import { deleteMatchDto } from './DTO/delete-match.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MatchesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly notificationsService: NotificationsService,
  ) { }

  async createLike(like: createLikeDto): Promise<string> {
    try {
      const result = await this.db.query(
        'SELECT add_user_like($1, $2) AS message',
        [like.user_1, like.user_2]
      );

      // El trigger trg_notify_on_like ya creó la notificación en la BD
      // Solo emitimos por WebSocket para notificación en tiempo real
      try {
        await this.notificationsService.emitNotificationAfterLike(like.user_2);
      } catch (notifError) {
        console.error('Error emitting notification:', notifError);
        // No fallar si la emisión WebSocket falla, el like ya se creó
      }

      return result[0].message;
    } catch (error) {

      throw new BadRequestException('Error creating like.');
    }
  }

  async deleteMatch(match: deleteMatchDto): Promise<string> {
    try {
      const result = await this.db.query(
        'SELECT delete_match_by_users($1, $2) AS message',
        [match.user_1, match.user_2]
      );

      return result[0].message;
    } catch (error) {
      throw new BadRequestException(
        error?.message || 'Error al eliminar el match'
      );
    }
  }

}

