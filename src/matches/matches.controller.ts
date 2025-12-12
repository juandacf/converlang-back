import { Body, Controller, Delete, Post, Query } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { createLikeDto } from './DTO/create-like.dto';
import { deleteMatchDto } from './DTO/delete-match.dto';

@Controller('matches')
export class MatchesController {
    constructor(private readonly matchService:MatchesService) {

    }

    @Post('/createLike')
    createLike(@Body() body:createLikeDto){
        return this.matchService.createLike(body);
    }

@Delete('/deleteMatch')
deleteMatch(@Query() query: deleteMatchDto) {
  return this.matchService.deleteMatch({
    user_1: Number(query.user_1),
    user_2: Number(query.user_2),
  });
}

}
