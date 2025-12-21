import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserPreferencesDto {
  @IsOptional()
  @IsBoolean()
  theme?: boolean;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  languageCode?: string;
}
