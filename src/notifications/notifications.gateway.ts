import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: { origin: '*' },
})
export class NotificationsGateway {
    @WebSocketServer()
    server: Server;

    // Mapa para rastrear usuarios conectados
    private connectedUsers: Map<number, string[]> = new Map();

    // Usuario se une a su sala personal de notificaciones
    @SubscribeMessage('joinNotifications')
    handleJoin(
        @MessageBody() userId: number,
        @ConnectedSocket() client: Socket,
    ) {
        const room = `user_notifications_${userId}`;
        client.join(room);

        // Registrar la conexión del usuario
        const existingClients = this.connectedUsers.get(userId) || [];
        existingClients.push(client.id);
        this.connectedUsers.set(userId, existingClients);


        return { ok: true, room };
    }

    // Manejar desconexión
    handleDisconnect(client: Socket) {
        // Limpiar el usuario del mapa cuando se desconecta
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
