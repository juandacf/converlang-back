import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CountriesModule } from './countries/countries.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [CountriesModule, DatabaseModule]
})
export class AppModule {}
