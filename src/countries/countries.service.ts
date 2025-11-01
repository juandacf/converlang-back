import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Country } from './DTO/country.type';
import { UpdateCountryDto } from './DTO/update-country.dto';

@Injectable()
export class CountriesService {
  constructor(private readonly db: DatabaseService) { }

  async getAll(): Promise<Country[]> {
    return this.db.query<Country>('SELECT country_code, country_name, timezone FROM get_all_countries()');
  }

  async findOne(id: string): Promise<Country | null> {
    const result = await this.db.query<Country>('SELECT country_code, country_name, timezone FROM get_country_by_code($1);', [id])
    return result[0] || null;
  }

  async create(data: Country): Promise<Country> {
    try {
      const result = await this.db.query<Country>(
        'SELECT country_code, country_name, timezone FROM add_country($1, $2, $3);',
        [data.country_code, data.country_name, data.timezone]
      );
      return result[0];
    } catch (err) {
      console.error('Error:', err);
      throw err;
    }
  }

  async update(id: string, data: UpdateCountryDto): Promise<Country> {
    const result = await this.db.query<Country>(
      `UPDATE countries 
     SET country_name = COALESCE($1, country_name),
         timezone = COALESCE($2, timezone)
     WHERE country_code = $3
     RETURNING *`,
      [data.country_name ?? null, data.timezone ?? null, id],
    );
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.query('DELETE FROM countries WHERE country_code = $1', [id]);
  }
}
