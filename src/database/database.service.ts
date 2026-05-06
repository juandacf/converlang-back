import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  async onModuleInit() {
    this.pool = new Pool({
      host: process.env.HOST,
      port: Number(process.env.PORT),
      user: process.env.USERR,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
    });

    try {
      await this.pool.query('SELECT 1');
      console.log('✅ ¡Conexión a la base de datos (Supabase) establecida exitosamente!');
    } catch (error) {
      console.error('❌ Error crítico al conectar a la base de datos:', error.message);
    }
  }

  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const result = await this.pool.query(text, params);
    return result.rows;
  }

  async onModuleDestroy() {
    await this.pool.end();

  }
}