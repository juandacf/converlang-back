import { Controller, Get, UseGuards } from '@nestjs/common';

import { AdminService } from './admin.service';

// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// import { RolesGuard } from '../auth/roles.guard';

// import { Roles } from '../auth/roles.decorator';



// @UseGuards(JwtAuthGuard, RolesGuard)

// @Roles('admin')

@Controller('admin')

export class AdminController {

  constructor(private readonly adminService: AdminService) {}



  @Get('stats')

  async getDashboardStats() {

    return this.adminService.getGeneralStats();

  }



  @Get('activity-chart')

  async getActivityChart() {

    return this.adminService.getActivityChartData();

  }



  @Get('reviews')

  async getRecentReviews() {

      return this.adminService.getRecentReviews();

  }

}

