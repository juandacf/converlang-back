import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private readonly logger = new Logger(DatabaseService.name);

  async onModuleInit() {
    try {
      this.logger.log('🔄 Intentando conectar a PostgreSQL...');
      
      this.pool = new Pool({
        host: process.env.HOST, 
        port: process.env.PORT,
        user: process.env.USERR,
        password: process.env.PASSWORD,
        database: process.env.DATABASE
      });

      // Prueba la conexión
      const result = await this.pool.query('SELECT NOW() as time, current_database() as db');
      this.logger.log(`✅ Conectado a la base de datos: ${result.rows[0].db}`);
      this.logger.log(`✅ Hora del servidor: ${result.rows[0].time}`);
      
    } catch (error) {
      this.logger.error('❌ Error conectando a PostgreSQL:');
      this.logger.error(`Mensaje: ${error.message}`);
      this.logger.error(`Código: ${error.code}`);
      throw error;
    }
  }

  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    try {
      this.logger.debug(`📝 Ejecutando query: ${text}`);
      const result = await this.pool.query(text, params);
      this.logger.debug(`✅ Query exitosa. Filas retornadas: ${result.rows.length}`);
      return result.rows;
    } catch (error) {
      this.logger.error(`❌ Error en query: ${text}`);
      this.logger.error(`Error: ${error.message}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('🔌 Conexión a la base de datos cerrada');
  }
}