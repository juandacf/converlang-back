import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { User } from './DTO/user.type';
import { createUserDto } from './DTO/create-user.dto';
import { updateUserDto } from './DTO/update-user.dto';
import { UserValidation } from './DTO/user-validation.type';
import bcrypt from 'bcryptjs';
import { potentialMatches } from './DTO/get-user-potential-matches.dto';
import * as fs from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';


@Injectable()
export class UsersService {

  private readonly AVATARS = [
    '/assets/avatars/Multiavatar-0bbf7d49e863432025.png',
    '/assets/avatars/Multiavatar-1593125f3419854463.png',
    '/assets/avatars/Multiavatar-17a81237eaddac789b.png',
    '/assets/avatars/Multiavatar-2468e3a8293b184639.png',
    '/assets/avatars/Multiavatar-2cf9de5100df77aed3.png',
    '/assets/avatars/Multiavatar-2d7dfeae6b62167b99.png',
    '/assets/avatars/Multiavatar-31992eebf6d8026034.png',
    '/assets/avatars/Multiavatar-36343766efdb988ba4.png',
    '/assets/avatars/Multiavatar-39f7bc53c52458f5c5.png',
    '/assets/avatars/Multiavatar-3e9cabf705e4dcdca6.png',
    '/assets/avatars/Multiavatar-3edf37e2b873192c7c.png',
    '/assets/avatars/Multiavatar-58b6d26948d3acd441.png',
    '/assets/avatars/Multiavatar-636c7b7ce7cec72503.png',
    '/assets/avatars/Multiavatar-636f20a5ae233f8177.png',
    '/assets/avatars/Multiavatar-6e31405b3c4525e656.png',
    '/assets/avatars/Multiavatar-6f6e1a71730995b6c7.png',
    '/assets/avatars/Multiavatar-79d6fd059b76ed94bf.png',
    '/assets/avatars/Multiavatar-8b9753850d85dc39f0.png',
    '/assets/avatars/Multiavatar-9348a1b0262646a309.png',
    '/assets/avatars/Multiavatar-a4a982b15fa0b5eddb.png',
    '/assets/avatars/Multiavatar-a7171f5ae110e70595.png',
    '/assets/avatars/Multiavatar-ae174f5f9f5a334b54.png',
    '/assets/avatars/Multiavatar-afb2bca4fd862f9e2e.png',
    '/assets/avatars/Multiavatar-b4bda0506d775e48e7.png',
    '/assets/avatars/Multiavatar-bc3ee20e433935bbcb.png',
    '/assets/avatars/Multiavatar-cd50503971acbd0791.png',
    '/assets/avatars/Multiavatar-d2ed96214209651e22.png',
    '/assets/avatars/Multiavatar-d7c3a1e2b4070af233.png',
    '/assets/avatars/Multiavatar-e3d21ed62a34ac4f49.png',
    '/assets/avatars/Multiavatar-e69fc3d59b2cdbc6ef.png',
    '/assets/avatars/Multiavatar-eab5911539d9bed30f.png',
    '/assets/avatars/Multiavatar-f843136cf9d908a7a4.png',
    '/assets/avatars/Multiavatar-fc7071de7fa90196d4.png',
  ];

  constructor(private readonly db: DatabaseService) {

  }

  async getAll(): Promise<User[]> {
    return this.db.query<User>('SELECT id_user, first_name, last_name, email, gender_id, birth_date, country_id, profile_photo, native_lang_id, target_lang_id, match_quantity, role_code, description, is_active, email_verified, last_login created_at, updated_at from get_all_users(TRUE)');
  }

  async findOne(id_user: Number): Promise<User | null> {
    const result = await this.db.query<User>('SELECT id_user, first_name, last_name, email, gender_id, birth_date, country_id, profile_photo, native_lang_id, target_lang_id, match_quantity, role_code, description, is_active, email_verified, last_login, created_at, updated_at from get_user_by_id($1)', [id_user])
    return result[0] || null
  }

  async create(user: createUserDto) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(user.password, salt);

    try {
      const avatarPath = `${this.AVATARS[Math.floor(Math.random() * this.AVATARS.length)]}`;

      const result = await this.db.query<User>(
        'SELECT * FROM fun_insert_usuarios($1, $2, $3, $4, $5, $6, $7, $12, $8, $9, 10, $10, $11)',
        [
          user.first_name,
          user.last_name,
          user.email,
          passwordHash,         // <-- AQUÍ ENTRARÁ EL HASH, NO LA CONTRASEÑA
          user.gender_id,
          user.birth_date,
          user.country_id,
          user.native_lang_id,
          user.target_lang_id,
          user.description,
          user.role_code,
          avatarPath, // $12: Foto aleatoria
        ]
      );

      return result[0];
    } catch (error) {
      // Manejar errores de clave duplicada (correo ya registrado)
      if (error.code === '23505' || error.message?.includes('ya está registrado')) {
        throw new ConflictException(
          error.message?.replace('Error: ', '') || 'El correo electrónico ya está registrado'
        );
      }

      // Manejar otros errores lanzados por la base de datos (RAISE EXCEPTION)
      throw new BadRequestException(
        error.message?.replace('Error: ', '') || 'Error al crear el usuario'
      );
    }
  }


  async update(id_user: number, user: updateUserDto): Promise<string> {
    const result = await this.db.query<{ first_name: string }>(
      `UPDATE users SET
          first_name = $2,
          last_name = $3,
          email = $4,
          gender_id = $5,
          birth_date = $6,
          country_id = $7,
          profile_photo = COALESCE($8, profile_photo),
          native_lang_id = $9,
          target_lang_id = $10,
          match_quantity = $11,
          description = $12,
          updated_at = NOW()
       WHERE id_user = $1
       RETURNING first_name`,
      [
        id_user,
        user.first_name,
        user.last_name,
        user.email,
        user.gender_id,
        user.birth_date,
        user.country_id,
        user.profile_photo || null,
        user.native_lang_id,
        user.target_lang_id,
        user.match_quantity,
        user.description || null,
      ]
    );

    return `Usuario ${result[0].first_name} actualizado correctamente`;
  }

  async delete(id_user: number): Promise<String> {
    const result = await this.db.query<String>(
      'SELECT delete_user($1) AS delete_user',
      [id_user]
    );
    return result[0];
  }

  async getPotentialMatches(id_user: number): Promise<potentialMatches[]> {
    const result = await this.db.query<potentialMatches>('SELECT * FROM fun_get_potential_users($1);', [id_user])
    return result;
  }

  async findByEmail(email: string) {
    const query = `
    SELECT * FROM fun_find_user_by_email($1);
  `;

    const result = await this.db.query(query, [email]);

    return result[0];
  }

  async getCurrentMatches(id_user: number): Promise<User[]> {
    const result = await this.db.query('SELECT * FROM fun_get_user_matches($1)', [id_user])
    return result;
  }

  async getUserAge(id_user: number): Promise<number> {
    const result = await this.db.query(
      'SELECT get_user_age($1) AS age',
      [id_user]
    );

    return result[0].age;
  }

  async updateProfilePhoto(id_user: number, photoPath: string | null,): Promise<string> {
    const result = await this.db.query<{ update_user_photo: string }>(
      `SELECT update_user_photo($1, $2) AS update_user_photo`,
      [id_user, photoPath],
    );

    return result[0].update_user_photo;
  }

  async getUserPhotoPath(id_user: number): Promise<string | null> {
    const result = await this.db.query(
      `SELECT profile_photo FROM users WHERE id_user = $1`,
      [id_user]
    );

    return result.length > 0 ? result[0].profile_photo : null;
  }

  deleteFileIfExists(relativePath: string) {
    try {
      const safePath = relativePath.replace(/^\/+/, "");
      const fullPath = join(process.cwd(), safePath);

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);

      } else {

      }
    } catch (e) {
      console.error("Error eliminando foto:", e.message);
    }
  }

  async reportUser(reportedUserId: number): Promise<{
    o_id_user: number;
    o_first_name: string;
    o_last_name: string;
    o_email: string;
    o_report_quantity: number;
    o_is_active: boolean;
  }> {
    const result = await this.db.query(
      'SELECT * FROM fun_generate_report($1)',
      [reportedUserId]
    );
    return result[0];
  }

  // Métodos agregados para Recuperación de Contraseña

  async createPasswordReset(id_user: number, token: string, expiresAt: Date) {
    const resetId = randomUUID(); // ID autogenerado uuidv4
    return this.db.query(
      `SELECT fun_create_password_reset($1, $2, $3, $4)`,
      [resetId, id_user, token, expiresAt]
    );
  }

  async getPasswordResetByToken(token: string) {
    const result = await this.db.query<{ id_user: number, expires_at: Date }>(
      `SELECT * FROM fun_get_password_reset_by_token($1)`,
      [token]
    );
    return result.length > 0 ? result[0] : null;
  }

  async deletePasswordResetByUserId(id_user: number) {
    return this.db.query(
      `SELECT fun_delete_password_reset($1)`,
      [id_user]
    );
  }

  async updatePassword(id_user: number, passwordHash: string) {
    return this.db.query(
      `SELECT fun_update_user_password($1, $2)`,
      [id_user, passwordHash]
    );
  }

}
