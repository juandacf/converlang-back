import { IsOptional, IsString, MaxLength, Matches, IsNotEmpty } from 'class-validator';

export class UpdateTitleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[a-z0-9_]+$/)
  title_code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title_name?: string;


  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title_description?: string;
}
