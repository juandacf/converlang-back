import { IsNumber } from "class-validator";

export class createLikeDto {
    @IsNumber()
    user_1: number;

    @IsNumber()
    user_2:number
}