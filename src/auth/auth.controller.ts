import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { userLoginDto } from './DTO/login.dto';

@Controller('auth')
export class AuthController {
constructor(private readonly authService:AuthService){

}


@Post('login')
async login(@Body() body: userLoginDto) {
  const user = await this.authService.validateUser(body.email, body.password);
  return this.authService.login(user);
}

}
