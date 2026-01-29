import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';

@Controller('preferences')
@UseGuards(JwtAuthGuard, ActiveUserGuard)
export class PreferencesController {

    constructor(private readonly preferencesService: PreferencesService) {

    }


    @Get(':user_id')
    getByUserId(@Param('user_id') user_id: number) {
        return this.preferencesService.getByUserId(user_id)
    }

    @Patch(':user_id')
    updatePreferences(@Param('user_id') user_id: number, @Body() body) {
        return this.preferencesService.update(user_id, body)
    }
}
