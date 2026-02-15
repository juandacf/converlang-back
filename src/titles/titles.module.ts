import { Module, forwardRef } from '@nestjs/common';
import { TitlesController } from './titles.controller';
import { TitlesService } from './titles.service';
import { DatabaseService } from 'src/database/database.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [TitlesController],
  providers: [TitlesService, DatabaseService]
})
export class TitlesModule { }
