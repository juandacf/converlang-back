import { Module } from '@nestjs/common';
import { TeacherProfilesController } from './teacher-profiles.controller';
import { TeacherProfilesService } from './teacher-profiles.service';
import { DatabaseService } from 'src/database/database.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [TeacherProfilesController],
  providers: [TeacherProfilesService, DatabaseService]
})
export class TeacherProfilesModule { }