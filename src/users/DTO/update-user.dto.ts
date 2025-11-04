import { IsDateString, IsEmail, IsNotEmpty, IsNumber, IsString, Matches, MaxLength, ValidateIf } from "class-validator";


export class updateUserDto {

    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    first_name: String

    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    last_name: String

    @IsString()
    @MaxLength(150)
    @IsNotEmpty()
    @IsEmail()
    @Matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, {
    message: 'El correo debe tener un formato válido (ejemplo@dominio.com)',
  })
    email: String
    
    @IsNumber()
    gender_id: Number;

    @IsDateString()
    @IsNotEmpty()
    @ValidateIf((obj) => {
      const birth = new Date(obj.birth_date);
      const today = new Date();
      const minDate = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
      return birth <= minDate;
    })
    birth_date: string;

    @IsString()
    @MaxLength(5)
    @IsNotEmpty()
    country_id: String;




}