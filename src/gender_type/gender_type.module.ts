import { Module } from '@nestjs/common';
import { GenderTypeService } from './gender_type.service';
import { GenderTypeController } from './gender_type.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [GenderTypeService, DatabaseService],
  controllers: [GenderTypeController]
})
export class GenderTypeModule { }
