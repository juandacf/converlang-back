import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Obtener la lista de chats
  @Get('list/:userId')
  getChatList(@Param('userId') userId: number) {
    return this.chatService.getChatList(userId);
  }

  // Obtener mensajes de un match
  @Get(':matchId')
  getMessages(@Param('matchId') matchId: number) {
    return this.chatService.getMessagesByMatch(matchId);
  }

  // Enviar mensaje sin WebSocket (solo REST)
  @Post('send')
  sendMessage(@Body() body: any) {
    return this.chatService.sendMessage(body.matchId, body.senderId, body.message);
  }
}
