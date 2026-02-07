import {
    Controller,
    Get,
    Put,
    Delete,
    Param,
    UseGuards,
    ParseIntPipe
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    // Obtener notificaciones de un usuario
    @Get(':userId')
    async getUserNotifications(@Param('userId', ParseIntPipe) userId: number) {
        return this.notificationsService.getUserNotifications(userId);
    }

    // Obtener contador de notificaciones no leídas
    @Get(':userId/unread-count')
    async getUnreadCount(@Param('userId', ParseIntPipe) userId: number) {
        const count = await this.notificationsService.getUnreadCount(userId);
        return { count };
    }

    // Marcar notificación como leída
    @Put(':notificationId/read')
    async markAsRead(@Param('notificationId', ParseIntPipe) notificationId: number) {
        const success = await this.notificationsService.markAsRead(notificationId);
        return { success };
    }

    // Marcar todas las notificaciones como leídas
    @Put(':userId/read-all')
    async markAllAsRead(@Param('userId', ParseIntPipe) userId: number) {
        const count = await this.notificationsService.markAllAsRead(userId);
        return { count };
    }

    // Eliminar notificación
    @Delete(':userId/:notificationId')
    async deleteNotification(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('notificationId', ParseIntPipe) notificationId: number
    ) {
        const success = await this.notificationsService.deleteNotification(notificationId, userId);
        return { success };
    }
}
