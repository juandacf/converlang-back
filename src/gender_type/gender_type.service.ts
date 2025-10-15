import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { gender_type } from './DTO/gender_type.type';

@Injectable()
export class GenderTypeService {
    constructor(private readonly db: DatabaseService) { //inyeccción de dependencias

    }

    async getAll(): Promise<gender_type[]> {
        const data = await this.db.query<gender_type>(`SELECT gender_id, gender_name FROM gender_type;`);
        return data;
    }
}