import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) { }

  private normalizeMatchId(matchId: any): number {
    // Soporta: 12, "12", "match_12"
    if (typeof matchId === 'string') {
      const m = matchId.match(/(\d+)/); // extrae el primer número
      if (m?.[1]) return Number(m[1]);
    }
    return Number(matchId);
  }

  private roomName(matchId: any): string {
    const id = this.normalizeMatchId(matchId);
    if (!Number.isFinite(id)) throw new Error(`Invalid matchId: ${matchId}`);
    return `match_${id}`;
  }

  // ===============================================
  // 1. Unirse a una sala (match)
  // ===============================================
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() matchId: any,
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.roomName(matchId);
    client.join(room);

    return { ok: true, room };
  }

  // ===============================================
  // 2. Enviar mensaje a una sala
  // ===============================================
  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() data: any) {
    const { matchId, senderId, message } = data;
    const numericId = Number(matchId);

    const savedMessage = await this.chatService.sendMessage(
      numericId,
      Number(senderId),
      message,
    );

    // FORZAR FORMA CONSISTENTE
    const payload = {
      message_id: savedMessage?.message_id ?? savedMessage?.id ?? Date.now(),
      match_id: numericId,
      sender_id: Number(senderId),
      message: savedMessage?.message ?? message,
      created_at: savedMessage?.created_at ?? new Date().toISOString(),
    };

    this.server.to(`match_${numericId}`).emit('newMessage', payload);
  }

}
