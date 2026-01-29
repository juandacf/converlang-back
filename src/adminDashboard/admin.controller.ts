import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  ParseBoolPipe
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateUserAdminDto } from './DTO/create-user-admin.dto';
import { UpdateUserAdminDto } from './DTO/update-user-admin.dto';
import { ChangePasswordDto } from './DTO/change-password.dto';

/**
 * Controlador del panel de administración
 * Gestiona usuarios, estadísticas y reportes
 */
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  // ========================================
  // ENDPOINTS DE ESTADÍSTICAS
  // ========================================

  /**
   * GET /admin/stats
   * Obtener estadísticas generales del dashboard
   */
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  /**
   * GET /admin/activity
   * Obtener actividad semanal (matches y sesiones)
   */
  @Get('activity')
  getActivity() {
    return this.adminService.getActivity();
  }

  /**
   * GET /admin/reviews
   * Obtener reseñas recientes
   */
  @Get('reviews')
  getReviews() {
    return this.adminService.getRecentReviews();
  }

  /**
   * GET /admin/user-distribution
   * Obtener distribución de usuarios
   */
  @Get('user-distribution')
  getUserDistribution() {
    return this.adminService.getUserDistribution();
  }

  /**
   * GET /admin/metrics
   * Obtener métricas clave del dashboard
   * Retorna: conversion_rate, verified_users, completed_sessions, average_time
   */
  @Get('metrics')
  getMetrics() {
    return this.adminService.getMetrics();
  }

  /**
   * GET /admin/user-growth
   * Obtener crecimiento de usuarios por día
   * Retorna: array con nuevos_usuarios por día de la semana
   */
  @Get('user-growth')
  getUserGrowth() {
    return this.adminService.getUserGrowth();
  }

  // ========================================
  // ENDPOINTS CRUD DE USUARIOS
  // ========================================

  /**
   * POST /admin/users
   * Crear un nuevo usuario desde el panel de administración
   * Body: CreateUserAdminDto
   */
  @Post('users')
  createUser(@Body() createUserDto: CreateUserAdminDto) {
    return this.adminService.createUser(createUserDto);
  }

  /**
   * GET /admin/users
   * Obtener todos los usuarios
   * Query params:
   * - includeInactive: boolean (default: false) - Incluir usuarios inactivos
   * - role: string (opcional) - Filtrar por rol (para compatibilidad con código anterior)
   */
  @Get('users')
  getUsers(
    @Query('includeInactive', new ParseBoolPipe({ optional: true })) includeInactive?: boolean,
    @Query('role') role?: string
  ) {
    // Si se proporciona un filtro de rol, usar el método legacy
    if (role) {
      return this.adminService.getUsers(role);
    }
    // Caso contrario, usar el nuevo método con la función de BD
    return this.adminService.getAllUsers(includeInactive || false);
  }

  /**
   * GET /admin/users/:id
   * Obtener un usuario específico por ID
   */
  @Get('users/:id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserById(id);
  }

  /**
   * PUT /admin/users/:id
   * Actualizar un usuario existente
   * Body: UpdateUserAdminDto
   */
  @Put('users/:id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserAdminDto
  ) {
    return this.adminService.updateUser(id, updateUserDto);
  }

  /**
   * DELETE /admin/users/:id
   * Inactivar un usuario (soft delete)
   * Marca el usuario como inactivo en lugar de eliminarlo permanentemente
   */
  @Delete('users/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.inactivateUser(id);
  }

  /**
   * PATCH /admin/users/:id/password
   * Cambiar contraseña de un usuario
   * Body: ChangePasswordDto
   */
  @Patch('users/:id/password')
  changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.adminService.changePassword(id, changePasswordDto);
  }

  /**
   * PATCH /admin/users/:id/activate
   * Reactivar un usuario inactivo
   * Marca el usuario como activo manteniendo el mismo ID
   */
  @Patch('users/:id/activate')
  activateUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.activateUser(id);
  }
}