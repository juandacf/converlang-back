import { Module } from '@nestjs/common';
import { LanguagesController } from './languages.controller';
import { LanguagesService } from './languages.service';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [LanguagesController],
  providers: [LanguagesService, DatabaseService]
})
export class LanguagesModule {}
