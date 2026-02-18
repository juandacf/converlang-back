import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

/**
 * Guard que verifica si el usuario está activo
 * Se aplica después de JwtAuthGuard para validar que el usuario no ha sido bloqueado
 * 
 * Si el usuario está inactivo (is_active = false), lanza UnauthorizedException
 * con el mensaje 'ACCOUNT_INACTIVE' para que el frontend pueda manejarlo
 */
@Injectable()
export class ActiveUserGuard implements CanActivate {
    constructor(private usersService: UsersService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user; // Viene del JwtAuthGuard

        if (!user || !user.userId) {
            throw new UnauthorizedException('Usuario no autenticado');
        }

        // Verificar si el usuario sigue activo en la base de datos
        const dbUser = await this.usersService.findOne(user.userId);

        if (!dbUser) {
            throw new UnauthorizedException('Usuario no encontrado');
        }

        // Debug: Ver el valor exacto de is_active


        // Validar que el usuario esté activo (maneja tanto boolean como string de PostgreSQL)
        if (dbUser.is_active === false || dbUser.is_active === 'f' || dbUser.is_active === 'false' || dbUser.is_active === 0) {
            throw new UnauthorizedException('ACCOUNT_INACTIVE: Tu cuenta ha sido desactivada. Por favor contacta a converlang@gmail.com');
        }

        return true;
    }
}
