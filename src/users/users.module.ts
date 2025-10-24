// src/users/users.module.ts

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
    imports: [DatabaseModule], // Importar módulo de base de datos
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService] // Exportar para usar en auth module
})
export class UsersModule {}