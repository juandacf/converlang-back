import { Body, Controller, Post } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { createLikeDto } from './DTO/create-like.dto';

@Controller('matches')
export class MatchesController {
    constructor(private readonly matchService:MatchesService) {

    }

    @Post('/createLike')
    createLike(@Body() body:createLikeDto){
        return this.matchService.createLike(body);
    }
}
