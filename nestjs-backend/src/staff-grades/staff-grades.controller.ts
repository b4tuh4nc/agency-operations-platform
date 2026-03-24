import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StaffGradesService } from './staff-grades.service';
import { CreateStaffGradeDto } from './dto/create-staff-grade.dto';
import { UpdateStaffGradeDto } from './dto/update-staff-grade.dto';

@Controller('staff-grades')
@ApiTags('staff-grades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class StaffGradesController {
  constructor(private readonly staffGradesService: StaffGradesService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni personel derecesi oluştur' })
  @ApiResponse({ status: 201, description: 'Personel derecesi oluşturuldu' })
  create(@Body() createStaffGradeDto: CreateStaffGradeDto) {
    return this.staffGradesService.create(createStaffGradeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Tüm personel derecelerini listele' })
  @ApiResponse({ status: 200, description: 'Personel dereceleri listelendi' })
  findAll() {
    return this.staffGradesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Personel derecesi detayını getir' })
  @ApiResponse({ status: 200, description: 'Personel derecesi bulundu' })
  findOne(@Param('id') id: string) {
    return this.staffGradesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Personel derecesini güncelle' })
  @ApiResponse({ status: 200, description: 'Personel derecesi güncellendi' })
  update(@Param('id') id: string, @Body() updateStaffGradeDto: UpdateStaffGradeDto) {
    return this.staffGradesService.update(id, updateStaffGradeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Personel derecesini sil' })
  @ApiResponse({ status: 200, description: 'Personel derecesi silindi' })
  remove(@Param('id') id: string) {
    return this.staffGradesService.remove(id);
  }
}




