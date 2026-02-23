import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { DatabaseModule } from '../database/database.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [DatabaseModule, UsersModule],
    controllers: [MetricsController],
    providers: [MetricsService],
})
export class MetricsModule { }
