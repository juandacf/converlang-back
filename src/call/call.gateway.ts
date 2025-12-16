import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class CallGateway {
  @WebSocketServer()
  server: Server;

  // ============================================
  // 0. Unirse a sala de videollamada
  // ============================================
  @SubscribeMessage('joinCallRoom')
  handleJoinCallRoom(
    @MessageBody() matchId: number,
    @ConnectedSocket() client: Socket,
  ) {
    const room = `call_${matchId}`;
    client.join(room);
    console.log(`📞 Cliente unido a sala de llamada: ${room}`);
  }

  // ============================================
  // 1. Solicitud de llamada entrante
  // ============================================
  @SubscribeMessage('callRequest')
  handleCallRequest(
    @MessageBody() data: { matchId: number; caller: any },
    @ConnectedSocket() client: Socket,
  ) {
    const { matchId, caller } = data;

    console.log(`📞 Solicitud de llamada enviada a sala call_${matchId}`);

    this.server.to(`call_${matchId}`).emit('incomingCall', {
      caller,
    });
  }

  // ============================================
  // 2. Llamada aceptada
  // ============================================
  @SubscribeMessage('callAccepted')
  handleCallAccepted(
    @MessageBody() data: { matchId: number },
  ) {
    this.server.to(`call_${data.matchId}`).emit('callAccepted');
  }

  // ============================================
  // 3. Llamada rechazada
  // ============================================
  @SubscribeMessage('callRejected')
  handleCallRejected(
    @MessageBody() data: { matchId: number },
  ) {
    this.server.to(`call_${data.matchId}`).emit('callRejected');
  }

  // ============================================
  // 4. OFFER SDP
  // ============================================
  @SubscribeMessage('webrtcOffer')
  handleWebRTCOffer(
    @MessageBody() data: { matchId: number; offer: any },
  ) {
    this.server.to(`call_${data.matchId}`).emit('webrtcOffer', {
      offer: data.offer,
    });
  }

  // ============================================
  // 5. ANSWER SDP
  // ============================================
  @SubscribeMessage('webrtcAnswer')
  handleWebRTCAnswer(
    @MessageBody() data: { matchId: number; answer: any },
  ) {
    this.server.to(`call_${data.matchId}`).emit('webrtcAnswer', {
      answer: data.answer,
    });
  }

  // ============================================
  // 6. ICE Candidates
  // ============================================
  @SubscribeMessage('webrtcIceCandidate')
  handleNewIceCandidate(
    @MessageBody() data: { matchId: number; candidate: any },
  ) {
    this.server.to(`call_${data.matchId}`).emit('webrtcIceCandidate', {
      candidate: data.candidate,
    });
  }
}
