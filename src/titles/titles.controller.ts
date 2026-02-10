import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { TitlesService } from './titles.service';
import { createUserDto } from 'src/users/DTO/create-user.dto';
import { CreateTitleDto } from './DTO/create-title-dto';
import { UpdateTitleDto } from './DTO/update-title-dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';

@Controller('titles')
export class TitlesController {
    constructor(private readonly titleService: TitlesService) { }

    @Get()
    getAll() {
        return this.titleService.getAll()
    }

    // Ruta específica DEBE ir ANTES de la ruta genérica ':title_code'
    @Get('latest/:userId')
    getLatestByUser(@Param('userId') userId: number) {
        return this.titleService.getLatestByUser(userId);
    }

    @Get(':title_code')
    findOne(@Param('title_code') title_code: string) {
        return this.titleService.findOne(title_code)
    }

    @Post()
    create(@Body() body: CreateTitleDto) {
        return this.titleService.create(body)
    }

    @Patch()
    update(@Body() body: UpdateTitleDto) {
        return this.titleService.update(body)
    }

    @Delete(':title_code')
    delete(@Param('title_code') title_code: string) {
        return this.titleService.delete(title_code)
    }
}
