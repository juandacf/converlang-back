import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength } from "class-validator";

    
    export class userLoginDto {
    @IsString()
    @MaxLength(150)
    @IsNotEmpty()
    @IsEmail()
    @Matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, {
    message: 'El correo debe tener un formato válido (ejemplo@dominio.com)',
  })
    email: string

  @IsString()
  @MaxLength(255)
  password :string;

    }
    
