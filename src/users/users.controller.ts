import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { createUserDto } from './DTO/create-user.dto';

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
 
}


