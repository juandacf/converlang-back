import { Controller, Get } from '@nestjs/common';
import { GenderTypeService } from './gender_type.service';

@Controller('gender-type')
export class GenderTypeController {
    constructor(private readonly gender: GenderTypeService) { }
    
    @Get()
    getAll() { 
        return this.gender.getAll();
    }
}
