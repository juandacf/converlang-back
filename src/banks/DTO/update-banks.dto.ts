import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateBanksDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  bank_name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 5)
  country_id?: string;
}