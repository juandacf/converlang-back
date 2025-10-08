import { IsString, Length } from 'class-validator';

export class CreateCountryDto {

  @IsString()
  @Length(2, 5)
  country_code: string;

  @IsString()
  @Length(2, 50)
  country_name: string;

  @IsString()
  @Length(2, 50)
  timezone: string;
}