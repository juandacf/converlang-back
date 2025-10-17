import { Controller, Get, Param } from '@nestjs/common';
import { GenderTypeService } from './gender_type.service';

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
    
    


}
