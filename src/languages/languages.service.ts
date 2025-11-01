import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Language } from './DTO/language.type';
import { CreateLanguageDto } from './DTO/create-language.dto';

@Injectable()
export class LanguagesService {
    constructor (private readonly db:DatabaseService){
        
    }

    async getAll(): Promise<Language[]> {
        return this.db.query<Language>('select language_code, language_name from languages ');
    }

    async findOne(language_code:string): Promise <Language | null> {
        const result = await this.db.query<Language> ('select language_code, language_name from languages where language_code = $1;', [language_code])
        return result[0]|| null
    }

    async create(data: Language) : Promise <Language> {
        try {
            const result = await this.db.query<Language>(
                'SELECT * FROM create_language($1, $2)', [data.language_code, data.language_name]
                
            )
            return result[0]
        } catch (error) {
            console.error('Error:', error)
            throw error;
        }
    }

    async update(language_code: string, data:CreateLanguageDto):Promise <Language> {
        const result = await this.db.query<Language> ('UPDATE languages SET language_name = $1 WHERE language_code = $2 RETURNING *;',[data.language_name, data.language_code ]);
        return result[0]
    }

    async delete(language_code: string): Promise<void> {
        await this.db.query('DELETE FROM languages WHERE language_code = $1', [language_code])
    }
}
