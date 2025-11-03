import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CountriesModule } from './countries/countries.module';
import { DatabaseModule } from './database/database.module';
import { LanguagesModule } from './languages/languages.module';
import { GenderTypeModule } from './gender_type/gender_type.module';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [CountriesModule, DatabaseModule, LanguagesModule, GenderTypeModule, UsersModule],
  controllers: [UsersController],
  providers: [UsersService]
})
export class AppModule { }
