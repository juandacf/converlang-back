import { Controller, Get, Patch, Delete, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('activity')
  getActivity() {
    return this.adminService.getActivity();
  }

  @Get('users')
  getUsers(@Query('role') role?: string) {
    return this.adminService.getUsers(role);
  }

  @Get('reviews')
  getReviews() {
    return this.adminService.getRecentReviews();
  }

  // Actualizar estado específico (Activo/Inactivo) desde el botón toggle
  @Patch('users/:id')
  updateUserStatus(
    @Param('id', ParseIntPipe) id: number, 
    @Body('is_active') isActive: boolean
  ) {
    return this.adminService.toggleUserStatus(id, isActive);
  }

  // Soft Delete (Inactivar) desde el botón de borrar
  @Delete('users/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteUser(id);
  }
}