import { Module } from '@nestjs/common';
import { TitlesController } from './titles.controller';
import { TitlesService } from './titles.service';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [TitlesController],
  providers: [TitlesService, DatabaseService]
})
export class TitlesModule {}
