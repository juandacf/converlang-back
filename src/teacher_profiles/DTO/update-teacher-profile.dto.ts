import { IsInt, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class UpdateTeacherProfileDto {
  // El user_id viene por parametro en la URL, pero es necesario para validar lógica interna si se requiere.
  // En este caso, como es el PK, no se suele actualizar, se usa para el WHERE.
  
  @IsOptional()
  @IsString()
  @Length(2, 2)
  teaching_language_id?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  lang_certification?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  academic_title?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  experience_certification?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hourly_rate?: number;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  years_experience?: number;

  @IsOptional()
  @IsString()
  availability_notes?: string;
}