import { Module } from '@nestjs/common';
import { CountriesController } from './countries.controller';
import { CountriesService } from './countries.service';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [CountriesController],
  providers: [CountriesService, DatabaseService]
})
export class CountriesModule {}
