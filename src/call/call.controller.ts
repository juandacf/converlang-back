import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CallService } from './call.service';
import { CreateExchangeSessionDto } from './DTO/exchange-sessions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';

@Controller('call')
@UseGuards(JwtAuthGuard, ActiveUserGuard)
export class CallController {

    constructor(private readonly callService: CallService) {

    }

    @Post()
    create(@Body() dto: CreateExchangeSessionDto) {
        return this.callService.create(dto)
    }

    @Get(':user_id')
    getCallStatistics(@Param('user_id') user_id: number) {
        return this.callService.getLastMonthCalls(user_id)
    }

}
