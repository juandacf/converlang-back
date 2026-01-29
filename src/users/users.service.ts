import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { User } from './DTO/user.type';
import { createUserDto } from './DTO/create-user.dto';
import { updateUserDto } from './DTO/update-user.dto';
import { UserValidation } from './DTO/user-validation.type';
import bcrypt from 'bcryptjs';
import { potentialMatches } from './DTO/get-user-potential-matches.dto';
import * as fs from 'fs';
import { join } from 'path';


@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {

  }

  async getAll(): Promise<User[]> {
    return this.db.query<User>('SELECT id_user, first_name, last_name, email, gender_id, birth_date, country_id, profile_photo, native_lang_id, target_lang_id, match_quantity, bank_id, role_code, description, is_active, email_verified, last_login created_at, updated_at from get_all_users(TRUE)');
  }

  async findOne(id_user: Number): Promise<User | null> {
    const result = await this.db.query<User>('SELECT id_user, first_name, last_name, email, gender_id, birth_date, country_id, profile_photo, native_lang_id, target_lang_id, match_quantity, bank_id, role_code, description, is_active, email_verified, last_login, created_at, updated_at from get_user_by_id($1)', [id_user])
    return result[0] || null
  }

  async create(user: createUserDto) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(user.password, salt);

    const result = await this.db.query<User>(
      'SELECT * FROM fun_insert_usuarios($1, $2, $3, $4, $5, $6, $7, NULL, $8, $9, 0, NULL, $10, $11)',
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
      ]
    );

    return result[0];
  }


  async update(id_user: number, user: updateUserDto): Promise<string> {
    const result = await this.db.query<{ update_user: string }>(
      `SELECT update_user(
          $1, $2, $3, $4, $5, $6, $7, 
          $8, $9, $10, $11, $12, $13
       ) AS update_user`,
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
        user.bank_id || null,
        user.description || null,
      ]
    );

    return result[0].update_user;
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
        console.log("Foto anterior eliminada:", fullPath);
      } else {
        console.log("No hay foto anterior en:", fullPath);
      }
    } catch (e) {
      console.error("Error eliminando foto:", e.message);
    }
  }



}
