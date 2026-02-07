import { Injectable, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
    constructor(
        private readonly db: DatabaseService,
        @Inject(forwardRef(() => NotificationsGateway))
        private readonly notificationsGateway: NotificationsGateway,
    ) { }

    // Emitir notificación por WebSocket después de que el trigger la crea
    async emitNotificationAfterLike(receiverId: number): Promise<void> {
        try {
            // Obtener la última notificación creada por el trigger
            const notification = await this.getLatestNotification(receiverId);

            if (notification) {
                // Emitir la notificación en tiempo real al usuario receptor
                this.notificationsGateway.sendNotification(receiverId, notification);
            }
        } catch (error) {
            console.error('Error emitting notification:', error);
        }
    }

    // Obtener notificaciones de un usuario
    async getUserNotifications(userId: number, limit: number = 20): Promise<any[]> {
        try {
            const result = await this.db.query(
                'SELECT * FROM get_user_notifications($1, $2)',
                [userId, limit]
            );
            return result;
        } catch (error) {
            throw new BadRequestException('Error al obtener las notificaciones');
        }
    }

    // Obtener la última notificación de un usuario
    async getLatestNotification(userId: number): Promise<any> {
        try {
            const result = await this.db.query(
                'SELECT * FROM get_user_notifications($1, 1)',
                [userId]
            );
            return result[0] || null;
        } catch (error) {
            console.error('Error getting latest notification:', error);
            return null;
        }
    }

    // Contar notificaciones no leídas
    async getUnreadCount(userId: number): Promise<number> {
        try {
            const result = await this.db.query(
                'SELECT count_unread_notifications($1) AS count',
                [userId]
            );
            return result[0]?.count || 0;
        } catch (error) {
            throw new BadRequestException('Error al contar las notificaciones');
        }
    }

    // Marcar notificación como leída
    async markAsRead(notificationId: number): Promise<boolean> {
        try {
            const result = await this.db.query(
                'SELECT mark_notification_as_read($1) AS success',
                [notificationId]
            );
            return result[0]?.success || false;
        } catch (error) {
            throw new BadRequestException('Error al marcar la notificación como leída');
        }
    }

    // Marcar todas las notificaciones como leídas
    async markAllAsRead(userId: number): Promise<number> {
        try {
            const result = await this.db.query(
                'SELECT mark_all_notifications_as_read($1) AS count',
                [userId]
            );
            return result[0]?.count || 0;
        } catch (error) {
            throw new BadRequestException('Error al marcar las notificaciones como leídas');
        }
    }

    // Eliminar notificación
    async deleteNotification(notificationId: number, userId: number): Promise<boolean> {
        try {
            const result = await this.db.query(
                'SELECT delete_notification($1, $2) AS success',
                [notificationId, userId]
            );
            return result[0]?.success || false;
        } catch (error) {
            throw new BadRequestException('Error al eliminar la notificación');
        }
    }
}
