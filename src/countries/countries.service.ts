import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Country } from './country.type';

@Injectable()
export class CountriesService {
      constructor(private readonly db: DatabaseService) {}

async getAll(): Promise<Country[]> {
  return this.db.query<Country>('SELECT country_code, country_name, timezone FROM countries');
}
}
