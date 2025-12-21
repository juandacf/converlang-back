import { Body, Controller, Get, Param, Patch, Req } from '@nestjs/common';
import { PreferencesService } from './preferences.service';

@Controller('preferences')
export class PreferencesController {

    constructor(private readonly preferencesService: PreferencesService){

    }


    @Get(':user_id')
    getByUserId(@Param('user_id') user_id:number){
        return this.preferencesService.getByUserId(user_id)
    }
    
    @Patch(':user_id')
    updatePreferences(@Param('user_id') user_id:number, @Body() body){
        return this.preferencesService.update(user_id, body)
    }
}
