import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateNotificationDto {
    @IsNumber()
    receiverId: number;

    @IsNumber()
    senderId: number;

    @IsString()
    type: string;
}

export class NotificationDto {
    notification_id: string;
    user_id: number;
    title: string;
    message: string;
    notification_type: string;
    related_entity_type: string;
    related_entity_id: string;
    is_read: boolean;
    read_at: Date;
    created_at: Date;
}
