
import { Module } from '@nestjs/common';
import { UserRolesController } from './user_roles.controller';
import { UserRolesService } from './user_roles.service';
import { DatabaseModule } from 'src/database/database.module';

import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [DatabaseModule, UsersModule, AuthModule],
    controllers: [UserRolesController],
    providers: [UserRolesService],
})
export class UserRolesModule { }
