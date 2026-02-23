import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';

@Controller('metrics')
@UseGuards(JwtAuthGuard, ActiveUserGuard)
export class MetricsController {
    constructor(private readonly metricsService: MetricsService) { }

    @Get(':userId')
    getAllMetrics(@Param('userId') userId: number) {
        return this.metricsService.getAllMetrics(userId);
    }
}
