import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Bank } from './DTO/banks.type';
import { CreateBanksDto } from './DTO/create-banks.dto';
import { UpdateBanksDto } from './DTO/update-banks.dto';

@Injectable()
export class BanksService {
  constructor(private readonly db: DatabaseService) {}

  async getAll(): Promise<Bank[]> {
    return this.db.query<Bank>(
      'SELECT bank_code, bank_name FROM get_all_banks()'
    );
  }

  async findOne(code: string): Promise<Bank | null> {
    const result = await this.db.query<Bank>(
      'SELECT bank_code, bank_name FROM get_bank_by_code($1);',
      [code]
    );
    return result[0] || null;
  }

  async create(data: CreateBanksDto): Promise<Bank> {
  try {
    const result = await this.db.query<Bank>(
      'SELECT bank_code, bank_name FROM add_bank($1, $2, $3);',
      [data.bank_code, data.bank_name, data.country_id]  
    );
    return result[0];
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
}

  async update(code: string, data: UpdateBanksDto): Promise<Bank> {
    const result = await this.db.query<Bank>(
      'SELECT bank_code, bank_name FROM update_bank($1, $2, $3);', 
      [data.bank_name ?? null, data.country_id ?? null, code]
    );
    return result[0];
  }

  async delete(code: string): Promise<string> {
    const result = await this.db.query(
      'SELECT delete_bank_by_code($1) AS message',
      [code]
    );
    return result[0].message;
  }
}