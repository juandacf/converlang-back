import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ChatService {
  constructor(private readonly db: DatabaseService) {}


  async getMatches(userId: number) {
    const result = await this.db.query(
      `SELECT * FROM fun_get_user_matches($1)`,
      [userId],
    );
    return result; // 👈 CORRECTO
  }


  async getMessagesByMatch(matchId: number) {
    const result = await this.db.query(
      `SELECT * FROM fun_get_messages_by_match($1)`,
      [matchId],
    );
    return result; // 👈 CORRECTO
  }


  async sendMessage(matchId: number, senderId: number, message: string) {
    const result = await this.db.query(
      `SELECT * FROM fun_send_message($1, $2, $3)`,
      [matchId, senderId, message],
    );

    return result[0]; // 👈 DEVUELVE EL MENSAJE INSERTADO
  }


  async markMessagesRead(matchId: number, userId: number) {
    await this.db.query(
      `SELECT fun_mark_messages_read($1, $2)`,
      [matchId, userId],
    );
  }


  async getChatList(userId: number) {
    const result = await this.db.query(
      `SELECT * FROM fun_get_chat_list($1)`,
      [userId],
    );
    return result; // 👈 CORRECTO
  }
}
