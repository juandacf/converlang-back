import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { User } from './DTO/user.type';
import { createUserDto } from './DTO/create-user.dto';
import { updateUserDto } from './DTO/update-user.dto';

@Injectable()
export class UsersService {
constructor(private readonly db:DatabaseService){

}

async getAll():Promise<User[]> {
    return this.db.query<User>('SELECT id_user, first_name, last_name, email, gender_id, birth_date, country_id, profile_photo, native_lang_id, target_lang_id, match_quantity, bank_id, role_code, description, is_active, email_verified, last_login created_at, updated_at from get_all_users(TRUE)');
}

async findOne(id_user: Number): Promise<User | null>{
    const result = await this.db.query<User>('SELECT id_user, first_name, last_name, email, gender_id, birth_date, country_id, profile_photo, native_lang_id, target_lang_id, match_quantity, bank_id, role_code, description, is_active, email_verified, last_login created_at, updated_at from get_user_by_id($1)', [id_user])
    return result[0] || null
}

async create(user: createUserDto): Promise<User> {

    
const result = await this.db.query<User>(
  'SELECT * FROM fun_insert_usuarios($1, $2, $3, $4, $5, $6, $7, NULL, $8, $9, 0, NULL, $10, $11)',
  [user.first_name, user.last_name, user.email, user.password, user.gender_id, user.birth_date, user.country_id, user.native_lang_id, user.target_lang_id, user.description, user.role_code]
);
    return result[0]
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

  async delete(id_user: number): Promise<string> {
    const result = await this.db.query<{ delete_user: string }>(
      'SELECT delete_user($1) AS delete_user',
      [id_user]
    );
    return result[0].delete_user;
  }
}
