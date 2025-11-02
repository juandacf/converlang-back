import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Language } from './DTO/language.type';
import { CreateLanguageDto } from './DTO/create-language.dto';

@Injectable()
export class LanguagesService {
    constructor (private readonly db:DatabaseService){
        
    }

    async getAll(): Promise<Language[]> {
        return this.db.query<Language>('SELECT language_code, language_name from get_all_languages();');
    }

    async findOne(language_code:string): Promise <Language | null> {
        const result = await this.db.query<Language> ('select language_code, language_name from get_language_by_id($1);', [language_code])
        return result[0]|| null
    }

    async create(data: Language) : Promise <Language> {
        try {
            const result = await this.db.query<Language>(
                'SELECT language_code, language_name FROM create_language($1, $2)', [data.language_code, data.language_name]
                
            )
            return result[0]
        } catch (error) {
            console.error('Error:', error)
            throw error;
        }
    }

    async update(language_code: string, data:CreateLanguageDto):Promise <Language> {
        const result = await this.db.query<Language> ('SELECT language_code, language_name FROM update_language($1, $2);',[data.language_code, data.language_name ]);
        return result[0]
    }

    async delete(language_code: string): Promise<String> {
       const result =  await this.db.query('SELECT delete_language($1) AS message', [language_code])

       return result[0].message
    }
    
}
