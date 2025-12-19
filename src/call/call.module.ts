import { Module } from '@nestjs/common';
import { CallGateway } from './call.gateway';
import { CallService } from './call.service';
import { CallController } from './call.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [CallGateway, CallService, DatabaseService],
  controllers: [CallController],
})
export class CallModule {}
