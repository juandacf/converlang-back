import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule { }