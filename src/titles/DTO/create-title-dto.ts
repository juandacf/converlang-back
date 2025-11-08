import { IsNotEmpty, IsString, MaxLength } from "class-validator";


export class CreateTitleDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    title_code : string

    @IsNotEmpty()
    @IsString() 
    @MaxLength(100)
    title_name : string

    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    title_description: string
}