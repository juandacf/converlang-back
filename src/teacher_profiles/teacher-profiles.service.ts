import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { TeacherProfile } from './DTO/teacher-profile.type';
import { CreateTeacherProfileDto } from './DTO/create-teacher-profile.dto';
import { UpdateTeacherProfileDto } from './DTO/update-teacher-profile.dto';

@Injectable()
export class TeacherProfilesService {
  constructor(private readonly db: DatabaseService) { }

  async getAll(): Promise<TeacherProfile[]> {
    // False indica que traiga todos, verificados o no.
    return this.db.query<TeacherProfile>('SELECT * FROM get_all_teacher_profiles(false)');
  }

  async findOne(id: number): Promise<TeacherProfile | null> {
    const result = await this.db.query<TeacherProfile>(
        'SELECT * FROM get_teacher_profile_by_id($1);', 
        [id]
    );
    return result[0] || null;
  }

  async create(data: CreateTeacherProfileDto): Promise<TeacherProfile> {
    try {
      const result = await this.db.query<TeacherProfile>(
        `SELECT * FROM add_teacher_profile($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
        [
          data.user_id,
          data.teaching_language_id,
          data.lang_certification ?? null,
          data.academic_title ?? null,
          data.experience_certification ?? null,
          data.hourly_rate ?? null,
          data.specialization ?? null,
          data.years_experience ?? null,
          data.availability_notes ?? null
        ]
      );
      return result[0];
    } catch (err) {
      console.error('Error creating teacher profile:', err);
      throw err;
    }
  }

  async update(id: number, data: UpdateTeacherProfileDto): Promise<TeacherProfile> {
    // Primero obtenemos el registro actual para no sobrescribir con nulls si el DTO viene parcial,
    // O confiamos en que el frontend envía todo. 
    // Dado que es PATCH, idealmente fusionamos o pasamos null si la SQL lo maneja.
    // La funcion SQL actualiza todo lo que recibe. Si enviamos NULL, lo pondrá NULL.
    // Para un PATCH robusto, deberíamos recuperar el actual. Aquí asumo que el objeto data trae lo necesario
    // o que el SQL maneja COALESCE (Tu SQL original sobreescribe valores).
    // *Importante*: Para seguir el estilo simple de countries, pasamos los valores directos.
    
    // Nota: La función update_teacher_profile requiere todos los parámetros obligatorios según tu definición SQL.
    // Si el DTO es parcial, esto podría fallar si envías NULLs a campos que no quieres borrar.
    // Para evitar esto en un diseño simple, asumiremos que el frontend envía el objeto completo editado o
    // hacemos un fetch previo aquí (recomendado para seguridad).
    
    const current = await this.findOne(id);
    if (!current) throw new Error('Profile not found');

    const result = await this.db.query<TeacherProfile>(
      `SELECT * FROM update_teacher_profile($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      [
        id,
        data.teaching_language_id ?? current.teaching_language_id, // Mantener anterior si no viene
        data.lang_certification ?? current.lang_certification,
        data.academic_title ?? current.academic_title,
        data.experience_certification ?? current.experience_certification,
        data.hourly_rate ?? current.hourly_rate,
        data.specialization ?? current.specialization,
        data.years_experience ?? current.years_experience,
        data.availability_notes ?? current.availability_notes
      ],
    );
    return result[0];
  }

  async delete(id: number): Promise<string> {
    // La función delete retorna un mensaje de texto.
    const result = await this.db.query<{ delete_teacher_profile: string }>(
        'SELECT delete_teacher_profile($1)', 
        [id]
    );
    // Dependiendo de cómo PG devuelva la columna escalar de una función, accedemos a la prop.
    // Generalmente es el nombre de la función.
    return result[0].delete_teacher_profile;
  }
}