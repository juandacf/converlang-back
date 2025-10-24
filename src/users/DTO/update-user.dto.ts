// src/users/DTO/update-user.dto.ts

import { IsEmail, IsString, IsOptional, IsInt, MaxLength, Min, Max, IsBoolean } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    first_name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    last_name?: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(150)
    email?: string;

    @IsOptional()
    @IsInt()
    gender_id?: number;

    @IsOptional()
    @IsString()
    @MaxLength(5)
    country_id?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    profile_photo?: string;

    @IsOptional()
    @IsString()
    @MaxLength(2)
    native_lang_id?: string;

    @IsOptional()
    @IsString()
    @MaxLength(2)
    target_lang_id?: string;

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
    description?: string;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}