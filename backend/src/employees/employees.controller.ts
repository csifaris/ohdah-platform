import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
@Controller('employees')
export class EmployeesController { constructor(private readonly employees: EmployeesService) {} @Post() create(@Body() dto: CreateEmployeeDto) { return this.employees.create(dto); } @Get() findAll(@Query('organizationId') organizationId: string, @Query('search') search?: string, @Query('departmentId') departmentId?: string) { return this.employees.findAll(organizationId, search, departmentId); } @Get(':id') findOne(@Param('id') id: string) { return this.employees.findOne(id); } @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) { return this.employees.update(id, dto); } @Delete(':id') remove(@Param('id') id: string) { return this.employees.remove(id); } }
