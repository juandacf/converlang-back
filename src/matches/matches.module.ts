import { Module, forwardRef } from '@nestjs/common';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { DatabaseService } from 'src/database/database.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule)
  ],
  controllers: [MatchesController],
  providers: [MatchesService, DatabaseService]
})
export class MatchesModule { }
