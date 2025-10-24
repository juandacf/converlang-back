import { IsEmail, IsNotEmpty, IsString, IsOptional, IsDateString, IsInt, MinLength, MaxLength, Matches, Min, Max } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    first_name: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    last_name: string;

    @IsEmail()
    @IsNotEmpty()
    @MaxLength(150)
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(255)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: 'La contraseña debe tener al menos una mayúscula, una minúscula, un número y un carácter especial'
    })
    password: string;

    @IsOptional()
    @IsInt()
    gender_id?: number;

    @IsDateString()
    @IsNotEmpty()
    birth_date: string; // Formato: YYYY-MM-DD

    @IsString()
    @IsNotEmpty()
    @MaxLength(5)
    country_id: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    profile_photo?: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(2)
    native_lang_id: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(2)
    target_lang_id: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    match_quantity?: number;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    bank_id?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    role_code?: string;

    @IsOptional()
    @IsString()
    description?: string;
}