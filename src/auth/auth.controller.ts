import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { userLoginDto } from './DTO/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() body: userLoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }

  /**
   * POST /auth/heartbeat
   * El frontend llama este endpoint cada 60 segundos con su JWT.
   * El guard AuthGuard('jwt') valida el token y pone { userId } en req.user.
   * Luego registramos el heartbeat en el Map del AuthService.
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('heartbeat')
  heartbeat(@Request() req) {
    this.authService.registerHeartbeat(req.user.userId);
    return { ok: true };
  }
}

