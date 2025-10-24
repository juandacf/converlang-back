import { IsString, Length } from "class-validator";


 export class CreateGender {

    @IsString()
    @Length(2,30)
    gender_name: string;

 }