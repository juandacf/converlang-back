import { IsOptional, IsString, Length } from 'class-validator';


export class UpdateCountryDto {
  @IsOptional()
  @IsString()
  @Length(2, 5)
  country_code?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  country_name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  timezone?: string;
}