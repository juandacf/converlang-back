
import { Controller, Get } from '@nestjs/common';
import { UserRolesService } from './user_roles.service';

@Controller('user-roles')
export class UserRolesController {
    constructor(private readonly userRolesService: UserRolesService) { }

    @Get()
    getAll() {
        return this.userRolesService.getAll();
    }
}
