import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

/**
 * DTO para la actualización de contraseña
 * Valida que la contraseña cumpla con los requisitos mínimos de seguridad
 */
export class ChangePasswordDto {
    @IsString({ message: 'La contraseña debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    @MaxLength(50, { message: 'La contraseña no puede exceder 50 caracteres' })
    password: string;
}
