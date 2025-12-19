import { Body, Controller, Post } from '@nestjs/common';
import { CallService } from './call.service';
import { CreateExchangeSessionDto } from './DTO/exchange-sessions.dto';

@Controller('call')
export class CallController {

    constructor(private readonly callService: CallService){

    }

    @Post()
    create(@Body() dto: CreateExchangeSessionDto){
        return this.callService.create(dto)
    }
}
