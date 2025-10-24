import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { gender_type } from './DTO/gender_type.type';
import { CreateGender } from './DTO/create-gender.dto';

@Injectable()
export class GenderTypeService {
    constructor(private readonly db: DatabaseService) {
    }

    async getAll(): Promise<gender_type[]> {
        const data = await this.db.query<gender_type>(`SELECT gender_id, gender_name FROM gender_type;`);
        return data;
    }

    async findOne(gender_id: Number): Promise<gender_type | null> {
        const result = await this.db.query<gender_type>(
            'SELECT gender_id, gender_name FROM gender_type WHERE gender_id = $1', 
            [gender_id]
        );
        return result[0] || null; 
    }

    async create(data: CreateGender): Promise<gender_type> {
        try {
            const result = await this.db.query<gender_type>(
                'INSERT INTO gender_type (gender_name) VALUES($1) RETURNING *',
                [data.gender_name]  
            );
            return result[0];
        } catch (err) {
            console.error('Error creating gender:', err);
            throw err;
        }
    }
}