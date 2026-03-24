import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SalariesService } from './salaries.service';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';

@Controller('salaries')
@ApiTags('salaries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class SalariesController {
  constructor(private readonly salariesService: SalariesService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni ücret kaydı oluştur' })
  @ApiResponse({ status: 201, description: 'Ücret kaydı oluşturuldu' })
  create(@Body() createSalaryDto: CreateSalaryDto) {
    return this.salariesService.create(createSalaryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Erişilebilir ücretleri listele (hierarchical)' })
  @ApiResponse({ status: 200, description: 'Ücretler listelendi' })
  findAll(@Request() req: any, @Query('userId') userId?: string, @Query('userRole') userRole?: string) {
    // Request'ten user bilgisini al
    const currentUser = req.user;
    const currentUserId = userId || currentUser?.userId || currentUser?.id || currentUser?._id;
    const currentUserRole = userRole || currentUser?.role;
    
    // Her zaman hierarchical erişim kullan
    if (currentUserId && currentUserRole) {
      return this.salariesService.findAccessibleSalaries(currentUserId, currentUserRole);
    }
    
    // Fallback: Eğer user bilgisi yoksa boş döndür
    return [];
  }

  @Get('my-salary')
  @ApiOperation({ summary: 'Kullanıcının kendi ücretini getir' })
  @ApiResponse({ status: 200, description: 'Kullanıcı ücreti bulundu' })
  findMySalary(@Request() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    return this.salariesService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ücret detayını getir' })
  @ApiResponse({ status: 200, description: 'Ücret bulundu' })
  findOne(@Param('id') id: string) {
    return this.salariesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Ücreti güncelle' })
  @ApiResponse({ status: 200, description: 'Ücret güncellendi' })
  update(@Param('id') id: string, @Body() updateSalaryDto: UpdateSalaryDto) {
    return this.salariesService.update(id, updateSalaryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Ücreti sil' })
  @ApiResponse({ status: 200, description: 'Ücret silindi' })
  remove(@Param('id') id: string) {
    return this.salariesService.remove(id);
  }
}

