import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { BanksService } from "./banks.service";
import { UpdateBanksDto } from "./DTO/update-banks.dto";
import { CreateBanksDto } from "./DTO/create-banks.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ActiveUserGuard } from "../auth/guards/active-user.guard";

@Controller('banks')
@UseGuards(JwtAuthGuard, ActiveUserGuard)
export class BanksController {
    constructor(private readonly banksService: BanksService) { }

    @Get()
    getAll() {
        return this.banksService.getAll();
    }

    @Get(':code')
    findOne(@Param('code') code: string) {
        return this.banksService.findOne(code);
    }

    @Post()
    create(@Body() body: CreateBanksDto) {
        return this.banksService.create(body);
    }

    @Patch(':code')
    update(@Param('code') code: string, @Body() body: UpdateBanksDto) {
        return this.banksService.update(code, body);
    }

    @Delete(':code')
    delete(@Param('code') code: string) {
        return this.banksService.delete(code);
    }
}