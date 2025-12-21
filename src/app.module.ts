import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CountriesModule } from './countries/countries.module';
import { DatabaseModule } from './database/database.module';
import { LanguagesModule } from './languages/languages.module';
import { GenderTypeModule } from './gender_type/gender_type.module';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { BanksModule } from './banks/banks.module';
import { TitlesModule } from './titles/titles.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/roles.guard';
import { TeacherProfilesModule } from './teacher_profiles/teacher-profiles.module';
import { MatchesModule } from './matches/matches.module';
import { ChatModule } from './chat/chat.module';
import { AdminModule } from './adminDashboard/admin.module';
import { CallModule } from './call/call.module';
import { PreferencesModule } from './preferences/preferences.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    CountriesModule,
    DatabaseModule,
    LanguagesModule,
    GenderTypeModule,
    UsersModule,
    BanksModule,
    TitlesModule,
    AuthModule,
    TeacherProfilesModule,
    MatchesModule,
    ChatModule,
    AdminModule,
    CallModule,
    PreferencesModule
  ],
providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    }
  ],
})
export class AppModule {}

