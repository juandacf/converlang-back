import { IsString, MaxLength } from "class-validator";

export class CreateBanksDto{
    
    @IsString()
    @MaxLength(5)
    bank_code: string;

    @IsString()
    @MaxLength(100)
    bank_name: string;

    @IsString()
    @MaxLength(2)
    country_id: string;
}