import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { User } from 'src/users/DTO/user.type';
import { UserValidation } from 'src/users/DTO/user-validation.type';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user: UserValidation | null = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(pass, user.password_hash);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    const { password_hash, ...result } = user;
    return result;
  }

  async login(user: User) {
    const payload = { sub: user.id_user, email: user.email, roles: [user.role_code], };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
