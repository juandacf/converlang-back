import { IsString, Length, MaxLength, MinLength } from "class-validator";

export class CreateLanguageDto {

    @IsString()
    @MinLength(2)
    @MaxLength(2)
    language_code: string;

    @IsString()
    @Length(1,100)
    language_name: string;
}