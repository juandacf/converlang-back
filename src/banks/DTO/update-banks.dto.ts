import { IsString, IsOptional } from 'class-validator';

export class UpdateBanksDto {
  @IsString()
  @IsOptional()
  bank_name?: string;

  @IsString()
  @IsOptional()
  country_id?: string;
}