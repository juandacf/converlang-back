// src/users/users.controller.ts

import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Patch, 
    Param, 
    Delete,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    Query
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './DTO/create-user.dto';
import { UpdateUserDto } from './DTO/update-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // ========================================
    // ENDPOINTS PÚBLICOS (sin guards por ahora)
    // ========================================

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    async findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto
    ) {
        return this.usersService.update(id, updateUserDto);
    }

    @Patch(':id/deactivate')
    async deactivate(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.deactivate(id);
    }

    @Patch(':id/activate')
    async activate(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.activate(id);
    }

    @Patch(':id/verify-email')
    async verifyEmail(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.verifyEmail(id);
    }

    @Patch(':id/change-password')
    async changePassword(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { oldPassword: string; newPassword: string }
    ) {
        return this.usersService.changePassword(
            id, 
            body.oldPassword, 
            body.newPassword
        );
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }

    @Get('matching/find')
    async findForMatching(
        @Query('country') country: string,
        @Query('nativeLang') nativeLang: string,
        @Query('targetLang') targetLang: string,
        @Query('excludeUser') excludeUser: number
    ) {
        return this.usersService.findForMatching(
            country,
            nativeLang,
            targetLang,
            excludeUser
        );
    }
}