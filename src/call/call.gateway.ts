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
    const room = `call_${Number(matchId)}`;
    client.join(room);

    return { ok: true, room };
  }

  // ============================================
  // 1. Solicitud de llamada entrante
  // ============================================
  @SubscribeMessage('callRequest')
  handleCallRequest(
    @MessageBody() data: { matchId: number; caller: any },
    @ConnectedSocket() client: Socket,
  ) {
    const matchId = Number(data.matchId);
    const room = `call_${matchId}`;



    // IMPORTANT: solo a los demás, no al emisor
    client.to(room).emit('incomingCall', {
      caller: data.caller,
    });

    return { ok: true };
  }

  // ============================================
  // 2. Llamada aceptada
  // ============================================
  @SubscribeMessage('callAccepted')
  handleCallAccepted(
    @MessageBody() data: { matchId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const matchId = Number(data.matchId);
    const room = `call_${matchId}`;

    // solo a los demás
    client.to(room).emit('callAccepted');

    return { ok: true };
  }

  // ============================================
  // 3. Llamada rechazada
  // ============================================
  @SubscribeMessage('callRejected')
  handleCallRejected(
    @MessageBody() data: { matchId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const matchId = Number(data.matchId);
    const room = `call_${matchId}`;

    client.to(room).emit('callRejected');
    return { ok: true };
  }

  // ============================================
  // 4. OFFER SDP
  // ============================================
  @SubscribeMessage('webrtcOffer')
  handleWebRTCOffer(
    @MessageBody() data: { matchId: number; offer: any },
    @ConnectedSocket() client: Socket,
  ) {
    const matchId = Number(data.matchId);
    const room = `call_${matchId}`;

    // solo a los demás (evita que el caller se procese su propia offer)
    client.to(room).emit('webrtcOffer', {
      offer: data.offer,
    });

    return { ok: true };
  }

  // ============================================
  // 5. ANSWER SDP
  // ============================================
  @SubscribeMessage('webrtcAnswer')
  handleWebRTCAnswer(
    @MessageBody() data: { matchId: number; answer: any },
    @ConnectedSocket() client: Socket,
  ) {
    const matchId = Number(data.matchId);
    const room = `call_${matchId}`;

    // solo a los demás (evita que el callee procese su propia answer)
    client.to(room).emit('webrtcAnswer', {
      answer: data.answer,
    });

    return { ok: true };
  }

  // ============================================
  // 6. ICE Candidates
  // ============================================
  @SubscribeMessage('webrtcIceCandidate')
  handleNewIceCandidate(
    @MessageBody() data: { matchId: number; candidate: any },
    @ConnectedSocket() client: Socket,
  ) {
    const matchId = Number(data.matchId);
    const room = `call_${matchId}`;

    client.to(room).emit('webrtcIceCandidate', {
      candidate: data.candidate,
    });

    return { ok: true };
  }

  // ============================================
  // 7. Terminar llamada
  // ============================================
  @SubscribeMessage('endCall')
  handleEndCall(
    @MessageBody() data: { matchId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const matchId = Number(data.matchId);
    const room = `call_${matchId}`;

    // Notificar al otro usuario
    client.to(room).emit('callEnded');

    return { ok: true };
  }

  // ============================================
  // 8. Transcripción en tiempo real (Paso 2)
  // ============================================
  @SubscribeMessage('transcribed_phrase')
  handleTranscribedPhrase(
    @MessageBody() data: { matchId: number; userId: number; languageId: string; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    const matchId = Number(data.matchId);

    // De momento, solo imprimimos en la consola del backend para confirmar el Paso 2
    console.log(`[🗣 Socket Recibido | Match ${matchId} | User ${data.userId}] en ${data.languageId}: "${data.text}"`);

    // Podríamos también retransmitirlo al otro usuario si quisiéramos mostrarle los subtítulos
    // const room = `call_${matchId}`;
    // client.to(room).emit('transcribed_phrase', data);

    return { ok: true };
  }

}
