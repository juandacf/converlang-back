import { Module } from '@nestjs/common';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [MatchesController],
  providers: [MatchesService, DatabaseService]
})
export class MatchesModule {}
