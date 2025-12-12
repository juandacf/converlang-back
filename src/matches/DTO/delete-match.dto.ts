import { IsNumber } from "class-validator";
import { Type } from "class-transformer";

export class deleteMatchDto {
  @Type(() => Number)
  @IsNumber()
  user_1: number;

  @Type(() => Number)
  @IsNumber()
  user_2: number;
}
