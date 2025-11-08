import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Title } from './DTO/title.type';
import { createUserDto } from 'src/users/DTO/create-user.dto';
import { CreateTitleDto } from './DTO/create-title-dto';
import { UpdateTitleDto } from './DTO/update-title-dto';

@Injectable()
export class TitlesService {

    constructor(private readonly db:DatabaseService){

    }

    async getAll(): Promise<Title[]> {
        return this.db.query<Title>('SELECT title_code, title_name, title_description FROM get_all_titles()')
    }

    async findOne(title_code: string) : Promise <Title | null> {
        const result = await this.db.query<Title> ('SELECT title_code, title_name, title_description FROM get_title_by_code($1)', [title_code])
        return result[0]
    }

    async create(data: CreateTitleDto): Promise <String> {
        const result = await this.db.query<String>('SELECT add_title($1, $2, $3);', [data.title_code, data.title_name, data.title_description])
        return result[0];
    }

    async update(data:UpdateTitleDto): Promise <String> {
        const result = await this.db.query<String> ( 'SELECT update_title($1, $2, $3)', [data.title_code, data.title_name, data.title_description])
        return result[0]
    }

    async delete(title_code: string) : Promise<String> {
        const result = await this.db.query<String> ('SELECT delete_title($1) ', [title_code]) 
        return result[0]
    }
    

}
