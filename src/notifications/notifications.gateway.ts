import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/** Decode a JWT payload without verifying the signature */
function decodeJwtPayload(token: string): any {
    try {
        const payloadBase64 = token.split('.')[1];
        const decoded = Buffer.from(payloadBase64, 'base64url').toString('utf-8');
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}


@WebSocketGateway({
    cors: { origin: '*' },
})
export class NotificationsGateway implements OnGatewayConnection {
    @WebSocketServer()
    server: Server;

    // Mapa para rastrear usuarios conectados
    private connectedUsers: Map<number, string[]> = new Map();

    // ── Auto-join al conectar usando el token JWT ──────────────────────────
    handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth?.token;
            if (!token) return;

            const decoded = decodeJwtPayload(token);
            const userId = Number(decoded?.sub);
            if (!userId || isNaN(userId)) return;

            const room = `user_notifications_${userId}`;
            client.join(room);

            const existing = this.connectedUsers.get(userId) || [];
            existing.push(client.id);
            this.connectedUsers.set(userId, existing);

        } catch (e) {
            console.warn('[Notifications] handleConnection error:', e?.message);
        }
    }

    // ── Fallback manual (por si el cliente lo emite explícitamente) ─────────
    @SubscribeMessage('joinNotifications')
    handleJoin(
        @MessageBody() userId: number,
        @ConnectedSocket() client: Socket,
    ) {
        const room = `user_notifications_${userId}`;
        client.join(room);

        const existingClients = this.connectedUsers.get(userId) || [];
        if (!existingClients.includes(client.id)) {
            existingClients.push(client.id);
            this.connectedUsers.set(userId, existingClients);
        }

        return { ok: true, room };
    }

    // Manejar desconexión
    handleDisconnect(client: Socket) {
        this.connectedUsers.forEach((clientIds, userId) => {
            const filteredIds = clientIds.filter(id => id !== client.id);
            if (filteredIds.length === 0) {
                this.connectedUsers.delete(userId);
            } else {
                this.connectedUsers.set(userId, filteredIds);
            }
        });
    }

    // Emitir notificación a un usuario específico
    sendNotification(userId: number, notification: any) {
        const room = `user_notifications_${userId}`;
        this.server.to(room).emit('newNotification', notification);
    }

    // Emitir actualización del contador de notificaciones
    sendUnreadCount(userId: number, count: number) {
        const room = `user_notifications_${userId}`;
        this.server.to(room).emit('unreadCountUpdate', { count });
    }
}

