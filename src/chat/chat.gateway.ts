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
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  // ===============================================
  // 1. Unirse a una sala (match)
  // ===============================================
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() matchId: number,
    @ConnectedSocket() client: Socket,
  ) {
    const room = `match_${matchId}`;
    client.join(room);
    console.log(`Cliente unido a sala: ${room}`);
  }

  // ===============================================
  // 2. Enviar mensaje a una sala
  // ===============================================
  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() data: any) {
    const { matchId, senderId, message } = data;

    // Guardar en BD con tu función PostgreSQL
    const savedMessage = await this.chatService.sendMessage(
      matchId,
      senderId,
      message,
    );

    // Emitir mensaje a todos en la sala
    this.server.to(`match_${matchId}`).emit('newMessage', savedMessage);
  }
}
