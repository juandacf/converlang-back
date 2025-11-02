import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { GenderTypeService } from './gender_type.service';
import { CreateGender } from './DTO/create-gender.dto';
import { UpdateGender } from './DTO/update-gender.dto';

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

    @Patch(':gender_id')
    update(@Param('gender_id') gender_id: Number, @Body() body:UpdateGender){
        return this.gender.update(gender_id, body )
    }
    
    @Delete(':gender_id')
    delete(@Param('gender_id') gender_id:Number){
        return this.gender.delete(gender_id)
    }

}
