import { IsString, Length } from "class-validator";

export class UpdateGender {

    @IsString()
    @Length(2,30)
    gender_name: string;

}