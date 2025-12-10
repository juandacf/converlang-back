import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { createUserDto } from './DTO/create-user.dto';
import { updateUserDto } from './DTO/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';

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

@Get('/getUserAge/:user_id')
getUserAge(@Param('user_id') user_id: number) {
  return this.usersService.getUserAge(user_id);
}

@Patch('photo/:id')
@UseInterceptors(
  FileInterceptor('photo', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        cb(null, join(process.cwd(), 'user-pics')); 
      },
      filename: (req, file, cb) => {
        cb(null, `${req.params.id}.png`);
      },
    }),
  }),
)
async uploadUserPhoto(
  @UploadedFile() file: Express.Multer.File,
  @Param('id') id: number,
) {
  if (!file) {
    throw new BadRequestException("No se recibió ningún archivo");
  }

  const previousPhoto = await this.usersService.getUserPhotoPath(id);

  const newPath = `/user-pics/${id}.png`;

  await this.usersService.updateProfilePhoto(id, newPath);

  return {
    message: "Foto actualizada correctamente",
    path: newPath,
  };
}
@Delete('photo/:id')
async deleteUserPhoto(@Param('id') id: number) {
  const previousPhoto = await this.usersService.getUserPhotoPath(id);

  if (previousPhoto) {
    this.usersService.deleteFileIfExists(previousPhoto);
  }

  await this.usersService.updateProfilePhoto(id, null);

  return { message: "Foto eliminada correctamente" };
}






}





