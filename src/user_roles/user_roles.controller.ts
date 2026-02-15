
import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRolesService } from './user_roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';

@Controller('user-roles')
@UseGuards(JwtAuthGuard, ActiveUserGuard)
export class UserRolesController {
    constructor(private readonly userRolesService: UserRolesService) { }

    @Get()
    getAll() {
        return this.userRolesService.getAll();
    }
}
