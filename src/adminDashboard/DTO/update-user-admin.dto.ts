import {
    IsDateString,
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    Min,
    Max
} from "class-validator";

/**
 * DTO para actualizar usuarios desde el panel de administración
 * Utiliza la función de BD: update_user
 */
export class UpdateUserAdminDto {

    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    first_name: string;

    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    last_name: string;

    @IsString()
    @MaxLength(150)
    @IsNotEmpty()
    @IsEmail()
    @Matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)
    email: string;

    @IsNumber()
    @IsOptional()
    gender_id?: number;

    @IsDateString()
    @IsNotEmpty()
    birth_date: string;

    @IsString()
    @MaxLength(5)
    @IsNotEmpty()
    country_id: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    profile_photo?: string;

    @IsString()
    @MaxLength(5)
    @IsNotEmpty()
    native_lang_id: string;

    @IsString()
    @MaxLength(5)
    @IsNotEmpty()
    target_lang_id: string;

    @IsNumber()
    @Min(1)
    @Max(100)
    match_quantity: number;


    @IsOptional()
    @IsString()
    description?: string;
}
