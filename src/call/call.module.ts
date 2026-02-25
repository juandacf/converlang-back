import { Module, forwardRef } from '@nestjs/common';
import { CallGateway } from './call.gateway';
import { CallService } from './call.service';
import { CallController } from './call.controller';
import { DatabaseService } from 'src/database/database.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    forwardRef(() => NotificationsModule),
  ],
  providers: [CallGateway, CallService, DatabaseService],
  controllers: [CallController],
})
export class CallModule { }

