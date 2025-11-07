import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateBanksDto {
  @IsString()
  @Length(1, 20)
  bank_code: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  bank_name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 5)
  country_id?: string;
}