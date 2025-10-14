import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { CreateLanguageDto } from './DTO/create-language.dto';

@Controller('languages')
export class LanguagesController {
    constructor(private readonly languagesService: LanguagesService ){}

    @Get()
    getAll(){
        return this.languagesService.getAll();
    }

    @Get(':language_code')
    findOne(@Param('language_code') language_code:string){
        return this.languagesService.findOne(String(language_code))
    }

    @Post()
    create(@Body() body: CreateLanguageDto){
        return this.languagesService.create(body);
    }
    


}
