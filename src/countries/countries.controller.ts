import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CountriesService } from './countries.service';
import type { Country } from './DTO/country.type';
import { CreateCountryDto } from './DTO/create-country.dto';
import { UpdateCountryDto } from './DTO/update-country.dto';


@Controller('countries')
export class CountriesController {
     constructor(private readonly countriesService: CountriesService) {}
    
     @Get()
     getAll() {
        return this.countriesService.getAll();
     }

     @Get(':id')
     findOne(@Param('id') id:string){
      return this.countriesService.findOne(String(id))
     }

     @Post()
     create(@Body() body: CreateCountryDto){
      return  this.countriesService.create(body);
     }

     @Patch(':code')
      update(@Param('code') code: string, @Body() body: UpdateCountryDto) {
      return this.countriesService.update(code, body);
      }
      @Delete(':code')
      delete(@Param('code') code:string){
         return this.countriesService.delete(code)
      }
}

