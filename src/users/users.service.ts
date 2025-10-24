// src/users/users.service.ts
// Enfoque híbrido: Validaciones en NestJS + Función BD como última capa de seguridad

import { 
    Injectable, 
    ConflictException, 
    NotFoundException, 
    BadRequestException 
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { User, PublicUser } from './DTO/users.type';
import { CreateUserDto } from './DTO/create-user.dto';
import { UpdateUserDto } from './DTO/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private readonly db: DatabaseService) {}

    // ========================================
    // MÉTODOS PRIVADOS (HELPERS)
    // ========================================

    /**
     * Elimina datos sensibles antes de enviar al cliente
     */
    private sanitizeUser(user: User): PublicUser {
        const { 
            password_hash, 
            last_login, 
            updated_at, 
            match_quantity, 
            bank_id, 
            ...publicUser 
        } = user;
        return publicUser as PublicUser;
    }

    /**
     * Valida edad mínima (15 años)
     * Primera capa: Validación rápida en backend
     */
    private validateAge(birthDate: string): void {
        const birth = new Date(birthDate);
        const today = new Date();
        const age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        // Ajuste si no ha cumplido años este año
        const adjustedAge = monthDiff < 0 || 
            (monthDiff === 0 && today.getDate() < birth.getDate()) 
            ? age - 1 
            : age;
        
        if (adjustedAge < 15) {
            throw new BadRequestException('Debes tener al menos 15 años para registrarte');
        }
    }

    /**
     * Hash de contraseña usando bcrypt
     * Debe SIEMPRE hacerse en backend por seguridad
     */
    private async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    /**
     * Mapea errores de la función BD a excepciones de NestJS
     */
    private handleDbFunctionError(status: string): never {
        const errorMap: { [key: string]: string } = {
            'ERROR_EMAIL_DUPLICADO': 'El email ya está registrado',
            'ERROR_IDIOMAS_IGUALES': 'El idioma nativo y objetivo deben ser diferentes',
            'ERROR_EDAD_MINIMA': 'Debes tener al menos 15 años para registrarte',
            'ERROR_NOMBRE_INVALIDO': 'El nombre no cumple con los requisitos',
            'ERROR_APELLIDO_INVALIDO': 'El apellido no cumple con los requisitos'
        };

        // Errores de foreign key
        if (status.includes('ERROR: PaÃ­s no vÃ¡lido')) {
            throw new BadRequestException('El país seleccionado no es válido');
        }
        if (status.includes('ERROR: Idioma')) {
            throw new BadRequestException('Uno de los idiomas seleccionados no es válido');
        }
        if (status.includes('ERROR: Banco')) {
            throw new BadRequestException('El banco seleccionado no es válido');
        }

        // Errores mapeados
        const message = errorMap[status] || 'Error al crear usuario';
        throw new BadRequestException(message);
    }

    // ========================================
    // CREAR USUARIO (ENFOQUE HÍBRIDO)
    // ========================================

    /**
     * Crea un nuevo usuario usando enfoque híbrido:
     * 1. Validaciones rápidas en NestJS (UX)
     * 2. Hash de contraseña en backend (seguridad)
     * 3. Función de BD como última capa (integridad)
     */
    async create(createUserDto: CreateUserDto): Promise<PublicUser> {
        try {
            // CAPA 1: Validaciones rápidas (fallan antes de operaciones costosas)
            this.validateAge(createUserDto.birth_date);

            // Validación de idiomas diferentes
            if (createUserDto.native_lang_id === createUserDto.target_lang_id) {
                throw new BadRequestException(
                    'El idioma nativo y el idioma objetivo deben ser diferentes'
                );
            }

            // CAPA 2: Hash de contraseña (SIEMPRE en backend)
            const passwordHash = await this.hashPassword(createUserDto.password);

            // CAPA 3: Llamar a función de BD (última línea de defensa)
            const result = await this.db.query<{ fun_insert_usuarios: string }>(
                `SELECT fun_insert_usuarios($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
                [
                    createUserDto.first_name,
                    createUserDto.last_name,
                    createUserDto.email,
                    passwordHash,
                    createUserDto.gender_id || null,
                    createUserDto.birth_date,
                    createUserDto.country_id,
                    createUserDto.profile_photo || null,
                    createUserDto.native_lang_id,
                    createUserDto.target_lang_id,
                    createUserDto.match_quantity || 10,
                    createUserDto.bank_id || null,
                    createUserDto.description || 'NO APLICA'
                ]
            );

            const response = result[0].fun_insert_usuarios;

            // Procesar respuesta de la función
            if (response.startsWith('Success')) {
                // Extraer ID del mensaje "Success: Usuario creado con ID 123"
                const match = response.match(/ID (\d+)/);
                if (match) {
                    const userId = parseInt(match[1]);
                    return this.findOne(userId);
                }
                throw new BadRequestException('Error al obtener ID del usuario creado');
            } else {
                // Mapear error de BD a excepción de NestJS
                this.handleDbFunctionError(response);
            }

        } catch (err) {
            console.error('Error creating user:', err);
            
            // Re-lanzar excepciones de NestJS
            if (err instanceof ConflictException || 
                err instanceof BadRequestException) {
                throw err;
            }

            // Manejar errores inesperados
            throw new BadRequestException('Error al crear usuario');
        }
    }

    // ========================================
    // CONSULTAR USUARIOS
    // ========================================

    /**
     * Obtiene todos los usuarios (solo admin)
     */
    async findAll(): Promise<PublicUser[]> {
        const users = await this.db.query<User>(
            `SELECT * FROM users ORDER BY created_at DESC`
        );
        return users.map(user => this.sanitizeUser(user));
    }

    /**
     * Obtiene un usuario por ID
     */
    async findOne(id: number): Promise<PublicUser> {
        const result = await this.db.query<User>(
            'SELECT * FROM users WHERE id_user = $1',
            [id]
        );

        if (result.length === 0) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }

        return this.sanitizeUser(result[0]);
    }

    /**
     * Busca un usuario por email (para autenticación)
     * Retorna datos completos incluyendo password_hash
     */
    async findByEmail(email: string): Promise<User | null> {
        const result = await this.db.query<User>(
            'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
            [email]
        );
        return result[0] || null;
    }

    /**
     * Busca usuarios por país e idiomas (para matching)
     */
    async findForMatching(
        countryId: string,
        nativeLangId: string,
        targetLangId: string,
        excludeUserId: number
    ): Promise<PublicUser[]> {
        const result = await this.db.query<User>(
            `SELECT * FROM users 
             WHERE country_id = $1 
             AND native_lang_id = $2 
             AND target_lang_id = $3 
             AND id_user != $4 
             AND is_active = TRUE
             ORDER BY created_at DESC
             LIMIT 50`,
            [countryId, nativeLangId, targetLangId, excludeUserId]
        );

        return result.map(user => this.sanitizeUser(user));
    }

    // ========================================
    // ACTUALIZAR USUARIO
    // ========================================

    /**
     * Actualiza campos de un usuario
     */
    async update(id: number, updateUserDto: UpdateUserDto): Promise<PublicUser> {
        try {
            // Verificar que el usuario existe
            await this.findOne(id);

            // Si se actualiza email, verificar unicidad
            if (updateUserDto.email) {
                const existing = await this.db.query<User>(
                    'SELECT id_user FROM users WHERE LOWER(email) = LOWER($1) AND id_user != $2',
                    [updateUserDto.email, id]
                );

                if (existing.length > 0) {
                    throw new ConflictException('El email ya está en uso por otro usuario');
                }
            }

            // Construir UPDATE dinámico
            const fields: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            Object.entries(updateUserDto).forEach(([key, value]) => {
                if (value !== undefined) {
                    fields.push(`${key} = $${paramIndex}`);
                    values.push(value);
                    paramIndex++;
                }
            });

            if (fields.length === 0) {
                throw new BadRequestException('No hay campos para actualizar');
            }

            // Agregar updated_at automáticamente
            fields.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(id);

            const result = await this.db.query<User>(
                `UPDATE users 
                 SET ${fields.join(', ')} 
                 WHERE id_user = $${paramIndex} 
                 RETURNING *`,
                values
            );

            return this.sanitizeUser(result[0]);

        } catch (err) {
            console.error('Error updating user:', err);
            
            if (err instanceof ConflictException || 
                err instanceof BadRequestException ||
                err instanceof NotFoundException) {
                throw err;
            }

            throw new BadRequestException('Error al actualizar usuario');
        }
    }

    // ========================================
    // GESTIÓN DE CUENTAS
    // ========================================

    /**
     * Desactiva una cuenta (soft delete)
     */
    async deactivate(id: number): Promise<{ message: string }> {
        await this.update(id, { is_active: false });
        return { message: 'Cuenta desactivada exitosamente' };
    }

    /**
     * Activa una cuenta
     */
    async activate(id: number): Promise<{ message: string }> {
        await this.update(id, { is_active: true });
        return { message: 'Cuenta activada exitosamente' };
    }

    /**
     * Verifica el email de un usuario
     */
    async verifyEmail(id: number): Promise<{ message: string }> {
        const result = await this.db.query<User>(
            `UPDATE users 
             SET email_verified = TRUE, updated_at = CURRENT_TIMESTAMP 
             WHERE id_user = $1 
             RETURNING *`,
            [id]
        );

        if (result.length === 0) {
            throw new NotFoundException('Usuario no encontrado');
        }

        return { message: 'Email verificado exitosamente' };
    }

    /**
     * Actualiza la fecha del último login
     */
    async updateLastLogin(id: number): Promise<void> {
        await this.db.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id_user = $1',
            [id]
        );
    }

    // ========================================
    // ELIMINACIÓN
    // ========================================

    /**
     * Elimina un usuario permanentemente (solo admin, usar con precaución)
     */
    async remove(id: number): Promise<{ message: string }> {
        const result = await this.db.query(
            'DELETE FROM users WHERE id_user = $1 RETURNING id_user',
            [id]
        );

        if (result.length === 0) {
            throw new NotFoundException('Usuario no encontrado');
        }

        return { message: 'Usuario eliminado permanentemente' };
    }

    // ========================================
    // AUTENTICACIÓN
    // ========================================

    /**
     * Valida una contraseña comparándola con el hash
     */
    async validatePassword(
        plainPassword: string, 
        hashedPassword: string
    ): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Cambia la contraseña de un usuario
     */
    async changePassword(
        userId: number, 
        oldPassword: string, 
        newPassword: string
    ): Promise<{ message: string }> {
        // Obtener usuario con password_hash
        const user = await this.findByEmail(
            (await this.findOne(userId)).email
        );

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Validar contraseña actual
        const isValidPassword = await this.validatePassword(
            oldPassword, 
            user.password_hash
        );

        if (!isValidPassword) {
            throw new BadRequestException('La contraseña actual es incorrecta');
        }

        // Hash de nueva contraseña
        const newPasswordHash = await this.hashPassword(newPassword);

        // Actualizar en BD
        await this.db.query(
            `UPDATE users 
             SET password_hash = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id_user = $2`,
            [newPasswordHash, userId]
        );

        return { message: 'Contraseña actualizada exitosamente' };
    }
}
