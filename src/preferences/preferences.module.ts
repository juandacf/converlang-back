import { Module } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { PreferencesController } from './preferences.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [PreferencesService, DatabaseService],
  controllers: [PreferencesController]
})
export class PreferencesModule {}
