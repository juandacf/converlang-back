import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GenderTypeService } from './gender_type.service';
import { CreateGender } from './DTO/create-gender.dto';

@Controller('gender-type')
export class GenderTypeController {
    constructor(private readonly gender: GenderTypeService) { }
    
    @Get()
    getAll() { 
        return this.gender.getAll();
    }

    @Get(':gender_id')
    findOne(@Param('gender_id') id: Number) {
        return this.gender.findOne(Number(id))
    }
    /* create unicamente diseñado para admins, ya que los usuarios solo lo consumiran los genders disponibles.*/
    @Post()
    create(@Body() body: CreateGender) {
        return this.gender.create(body);
    }
    

}
