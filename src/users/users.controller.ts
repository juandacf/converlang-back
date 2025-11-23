import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { createUserDto } from './DTO/create-user.dto';
import { updateUserDto } from './DTO/update-user.dto';

@Controller('users')
export class UsersController {
    constructor (private readonly usersService: UsersService ){

    }

@Get()
getAll(){
    return this.usersService.getAll()
}

@Get(':user_id')
findOne(@Param('user_id') user_id: Number){
    return this.usersService.findOne(Number(user_id))
}

@Post()
create(@Body() body:createUserDto) {
    return this.usersService.create(body);
}

@Patch(':user_id')
update(@Param('user_id') user_id: number, @Body() body:updateUserDto){
    return this.usersService.update(user_id, body)}

@Delete(':user_id')
delete(@Param('user_id') user_id: number){
    return this.usersService.delete(user_id)
}

@Get('/potentialMatches/:user_id')
getPotentialMatches(@Param('user_id') user_id:number){
    return this.usersService.getPotentialMatches(user_id)
}

@Get('/getCurrentMatches/:user_id')
getCurrentMatches(@Param('user_id') user_id:number){
    return this.usersService.getCurrentMatches(user_id)
}
}





