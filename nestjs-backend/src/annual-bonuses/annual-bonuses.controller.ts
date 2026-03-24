import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnnualBonusesService } from './annual-bonuses.service';
import { CreateAnnualBonusDto } from './dto/create-annual-bonus.dto';
import { UpdateAnnualBonusDto, ApproveBonusDto, RejectBonusDto } from './dto/update-annual-bonus.dto';

@Controller('annual-bonuses')
@ApiTags('annual-bonuses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AnnualBonusesController {
  constructor(private readonly annualBonusesService: AnnualBonusesService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni yıllık bonus kaydı oluştur' })
  @ApiResponse({ status: 201, description: 'Yıllık bonus kaydı oluşturuldu' })
  create(@Body() createAnnualBonusDto: CreateAnnualBonusDto) {
    return this.annualBonusesService.create(createAnnualBonusDto);
  }

  @Get()
  @ApiOperation({ summary: 'Erişilebilir bonusları listele (hierarchical)' })
  @ApiResponse({ status: 200, description: 'Bonuslar listelendi' })
  findAll(@Request() req: any, @Query('userId') userId?: string, @Query('userRole') userRole?: string) {
    // Request'ten user bilgisini al
    const currentUser = req.user;
    const currentUserId = userId || currentUser?.userId || currentUser?.id || currentUser?._id;
    const currentUserRole = userRole || currentUser?.role;
    
    // Her zaman hierarchical erişim kullan
    if (currentUserId && currentUserRole) {
      return this.annualBonusesService.findAccessibleBonuses(currentUserId, currentUserRole);
    }
    
    // Fallback: Eğer user bilgisi yoksa boş döndür
    return [];
  }

  @Get('my-bonus')
  @ApiOperation({ summary: 'Kullanıcının kendi bonuslarını getir' })
  @ApiResponse({ status: 200, description: 'Kullanıcı bonusları bulundu' })
  findMyBonuses(@Request() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
    return this.annualBonusesService.findAccessibleBonuses(userId, req.user?.role || '');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bonus detayını getir' })
  @ApiResponse({ status: 200, description: 'Bonus bulundu' })
  findOne(@Param('id') id: string) {
    return this.annualBonusesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Bonusu güncelle' })
  @ApiResponse({ status: 200, description: 'Bonus güncellendi' })
  update(@Param('id') id: string, @Body() updateAnnualBonusDto: UpdateAnnualBonusDto) {
    return this.annualBonusesService.update(id, updateAnnualBonusDto);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Bonusu onayla' })
  @ApiResponse({ status: 200, description: 'Bonus onaylandı' })
  approve(@Param('id') id: string, @Request() req: any, @Body() approveDto?: ApproveBonusDto) {
    const approverId = req.user?.userId || req.user?.id || req.user?._id;
    return this.annualBonusesService.approve(id, approverId, approveDto);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Bonusu reddet' })
  @ApiResponse({ status: 200, description: 'Bonus reddedildi' })
  reject(@Param('id') id: string, @Request() req: any, @Body() rejectDto: RejectBonusDto) {
    const approverId = req.user?.userId || req.user?.id || req.user?._id;
    return this.annualBonusesService.reject(id, approverId, rejectDto);
  }

  @Post(':id/mark-paid')
  @ApiOperation({ summary: 'Bonusu ödendi olarak işaretle' })
  @ApiResponse({ status: 200, description: 'Bonus ödendi olarak işaretlendi' })
  markAsPaid(@Param('id') id: string) {
    return this.annualBonusesService.markAsPaid(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Bonusu sil' })
  @ApiResponse({ status: 200, description: 'Bonus silindi' })
  remove(@Param('id') id: string) {
    return this.annualBonusesService.remove(id);
  }
}

