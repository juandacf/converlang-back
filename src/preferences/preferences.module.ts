import { Module, forwardRef } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { PreferencesController } from './preferences.controller';
import { DatabaseService } from 'src/database/database.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule)
  ],
  providers: [PreferencesService, DatabaseService],
  controllers: [PreferencesController]
})
export class PreferencesModule { }
