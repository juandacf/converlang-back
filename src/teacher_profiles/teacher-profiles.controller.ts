import { Body, Controller, Delete, Get, Param, Patch, Post, ParseIntPipe } from '@nestjs/common';
import { TeacherProfilesService } from './teacher-profiles.service';
import { CreateTeacherProfileDto } from './DTO/create-teacher-profile.dto';
import { UpdateTeacherProfileDto } from './DTO/update-teacher-profile.dto';

@Controller('teacher-profiles')
export class TeacherProfilesController {
     constructor(private readonly teacherProfilesService: TeacherProfilesService) {}
    
     @Get()
     getAll() {
        return this.teacherProfilesService.getAll();
     }

     @Get(':id')
     findOne(@Param('id', ParseIntPipe) id: number){
        return this.teacherProfilesService.findOne(id);
     }

     @Post()
     create(@Body() body: CreateTeacherProfileDto){
        return this.teacherProfilesService.create(body);
     }

     @Patch(':id')
     update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateTeacherProfileDto) {
        return this.teacherProfilesService.update(id, body);
     }

     @Delete(':id')
     delete(@Param('id', ParseIntPipe) id: number){
         return this.teacherProfilesService.delete(id);
     }
}