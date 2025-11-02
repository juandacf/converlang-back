import { IsNotEmpty, isNotEmpty, IsString, Length } from "class-validator";

export class UpdateGender {

    
    @IsString()
    @IsNotEmpty()
    @Length(2,30)
    gender_name: string;

}