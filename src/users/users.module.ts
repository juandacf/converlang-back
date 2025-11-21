import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseService } from 'src/database/database.service';
import bcrypt from 'node_modules/bcryptjs/umd/types';

@Module({
  providers: [UsersService, DatabaseService],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UsersModule {}
