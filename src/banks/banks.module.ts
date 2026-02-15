import { Module } from '@nestjs/common';
import { BanksController } from './banks.controller';
import { BanksService } from './banks.service';
import { DatabaseModule } from 'src/database/database.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [BanksController],
  providers: [BanksService],
  exports: [BanksService]
})
export class BanksModule { }