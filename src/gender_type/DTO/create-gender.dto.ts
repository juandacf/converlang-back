import { IsNotEmpty, IsString, Length } from "class-validator";


 export class CreateGender {

    @IsString()
    @Length(2,30)
    @IsNotEmpty()
    gender_name: string;

 }