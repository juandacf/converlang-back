import { IsInt, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class CreateTeacherProfileDto {
  @IsInt()
  user_id: number;

  @IsString()
  @Length(2, 2)
  teaching_language_id: string;

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