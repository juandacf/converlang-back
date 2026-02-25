import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import Groq from 'groq-sdk';
import { Inject, forwardRef } from '@nestjs/common';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class CallGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => NotificationsGateway))
    private readonly notificationsGateway: NotificationsGateway,
  ) { }

  // Usuarios actualmente en llamada: userId -> matchId
  private usersInCall = new Map<number, number>();

  // Groq SDK Client (we will pass the key via environment variables in production)
  // For the POC, if there's no env var, we instantiate without it to show the logic structure.
  private groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_key_if_not_set' });

  // ============================================
  // 0. Unirse a sala de videollamada
  // ============================================
  @SubscribeMessage('joinCallRoom')
  handleJoinCallRoom(
    @MessageBody() data: { matchId: number; userId?: number },
    @ConnectedSocket() client: Socket,
  ) {
    const matchId = typeof data === 'number' ? data : Number(data.matchId);
    const userId = typeof data === 'number' ? null : data.userId;
    const room = `call_${matchId}`;
    client.join(room);

    // Registrar usuario como "en llamada"
    if (userId) {
      this.usersInCall.set(Number(userId), matchId);
    }

    return { ok: true, room };
  }

  // ============================================
  // 1. Solicitud de llamada entrante
  // ============================================
  @SubscribeMessage('callRequest')
  handleCallRequest(
    @MessageBody() data: { matchId: number; caller: any; targetUserId?: number },
    @ConnectedSocket() client: Socket,
  ) {
    const matchId = Number(data.matchId);
    const room = `call_${matchId}`;

    // Verificar si el usuario destino ya está en una llamada
    if (data.targetUserId && this.usersInCall.has(Number(data.targetUserId))) {
      // Notificar al caller que el usuario está ocupado
      this.notificationsGateway.sendNotification(Number(data.caller?.userId), {
        type: 'user_busy',
        matchId,
        targetUserId: Number(data.targetUserId),
      });
      return { ok: false, reason: 'user_busy' };
    }

    // Emitir a la sala de la llamada (para quienes ya estén en VideoCall)
    client.to(room).emit('incomingCall', {
      caller: data.caller,
    });

    // Emitir notificación GLOBAL al usuario objetivo (sin importar en qué página esté)
    if (data.targetUserId) {
      this.notificationsGateway.sendNotification(Number(data.targetUserId), {
        type: 'incoming_call',
        matchId,
        caller: data.caller,
      });
    }

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
  // 3. Llamada rechazada / no contestada
  // ============================================
  @SubscribeMessage('callRejected')
  handleCallRejected(
    @MessageBody() data: { matchId: number; callerUserId?: number; reason?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const matchId = Number(data.matchId);
    const room = `call_${matchId}`;

    client.to(room).emit('callRejected');

    // Notificar al caller por su canal personal
    if (data.callerUserId) {
      this.notificationsGateway.sendNotification(Number(data.callerUserId), {
        type: 'call_rejected',
        matchId,
        reason: data.reason || 'rejected',
      });
    }

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
    @MessageBody() data: { matchId: number; targetUserId?: number; userId?: number },
    @ConnectedSocket() client: Socket,
  ) {
    const matchId = Number(data.matchId);
    const room = `call_${matchId}`;

    // Quitar ambos usuarios del mapa de "en llamada"
    if (data.userId) this.usersInCall.delete(Number(data.userId));
    if (data.targetUserId) this.usersInCall.delete(Number(data.targetUserId));

    // Notificar al otro usuario por la sala de la llamada
    client.to(room).emit('callEnded');

    // También notificar por la sala personal de notificaciones (respaldo)
    if (data.targetUserId) {
      this.notificationsGateway.sendNotification(Number(data.targetUserId), {
        type: 'call_ended',
        matchId,
      });
    }

    return { ok: true };
  }

  // ============================================
  // 8. Transcripción en tiempo real (Paso 2 y Paso 3)
  // ============================================
  @SubscribeMessage('transcribed_phrase')
  async handleTranscribedPhrase(
    @MessageBody() data: { matchId: number; userId: number; languageId: string; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    const matchId = Number(data.matchId);
    console.log(`[🗣 Socket Recibido | Match ${matchId} | User ${data.userId}] en ${data.languageId}: "${data.text}"`);

    // --- PASO 3: Mandar a la IA para corrección gramatical ---
    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a conversational language teacher for ${data.languageId}. 
            The user is speaking out loud in a video call. 
            CRITICAL INSTRUCTION: You MUST COMPLETELY IGNORE missing commas, periods, question marks, capitalization errors, or minor transcription spelling variations.
            If the ONLY issue with the sentence is missing punctuation or capitalization, you MUST return { "hasError": false }.
            ONLY flag an error if there is a CLEAR spoken grammatical mistake, wrong verb conjugation, syntax error, or severe vocabulary misuse (e.g., "I is happy" or "Yo tener hambre").
            If there is a real spoken error, return ONLY a JSON object with: { "hasError": true, "correction": "the correct phrase", "explanation": "a very short 1 sentence explanation in the ${data.languageId} language" }. 
            If the phrase is grammatically correct to say out loud, return ONLY a JSON object: { "hasError": false }. 
            Do not output any markdown formatting or extra text, just the raw JSON.`
          },
          {
            role: 'user',
            content: data.text
          }
        ],
        temperature: 0.1, // Baja temperatura para mantener respuestas estrictamente limitadas al JSON
        max_tokens: 150,
      });

      const aiResponseText = response.choices[0]?.message?.content || '{}';
      let correctionData = { hasError: false };

      try {
        const cleanJson = aiResponseText.replace(/```json/g, '').replace(/```/g, '');
        correctionData = JSON.parse(cleanJson);
      } catch (e) {
        console.error("Groq no devolvió un JSON válido:", aiResponseText);
      }

      console.log(`[🧠 IA Análisis]:`, correctionData);

      // --- PASO 4: Enviar la corrección de vuelta al Frontend (al mismo usuario) ---
      client.emit('grammar_correction', {
        originalText: data.text,
        correction: correctionData
      });

    } catch (error) {
      console.error("[Groq API Error]: Posiblemente falte configurar la api key GROQ_API_KEY en .env", error.message);
    }

    return { ok: true };
  }

}
