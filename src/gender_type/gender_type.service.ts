import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { gender_type } from './DTO/gender_type.type';
import { CreateGender } from './DTO/create-gender.dto';
import { UpdateCountryDto } from 'src/countries/DTO/update-country.dto';
import { UpdateGender } from './DTO/update-gender.dto';

@Injectable()
export class GenderTypeService {
    constructor(private readonly db: DatabaseService) {
    }

    async getAll(): Promise<gender_type[]> {
        const data = await this.db.query<gender_type>(`SELECT gender_id, gender_name FROM get_all_gender_types();`);
        return data;
    }

    async findOne(gender_id: Number): Promise<gender_type | null> {
        const result = await this.db.query<gender_type>(
            'SELECT gender_id, gender_name FROM get_gender_type_by_id($1)', 
            [gender_id]
        );
        return result[0] || null; 
    }

    async create(data: CreateGender): Promise<gender_type> {
        try {
            const result = await this.db.query<gender_type>(
                'SELECT gender_id, gender_name FROM  add_gender_type($1)',
                [data.gender_name]  
            );
            return result[0];
        } catch (err) {
            console.error('Error creating gender:', err);
            throw err;
        }
    }

    async update(gender_id: Number, data:UpdateGender): Promise <gender_type>{
        const result = await this.db.query('SELECT gender_id, gender_name FROM update_gender_type($1, $2) ', [gender_id, data.gender_name]);
        return result[0]
    }

    async delete(gender_id: Number):Promise <string> {
        const result = await this.db.query('SELECT delete_gender_type($1) AS message', [gender_id])
        return result[0].message
    } 

}