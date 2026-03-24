import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// Basit bir guard - gerçek projede JWT guard kullanılır
@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm kullanıcıları listele' })
  @ApiResponse({ status: 200, description: 'Kullanıcı listesi' })
  async findAll(@Request() req: any, @Query('userId') userId?: string, @Query('userRole') userRole?: string) {
    // Eğer userId ve userRole varsa, hierarchical erişim kontrolü yap
    if (userId && userRole) {
      return this.usersService.findAccessibleUsers(userId, userRole);
    }
    // Admin için tüm kullanıcılar
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Kullanıcı detayını getir' })
  @ApiResponse({ status: 200, description: 'Kullanıcı detayı' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni kullanıcı oluştur' })
  @ApiResponse({ status: 201, description: 'Kullanıcı oluşturuldu' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    // Password'u response'dan çıkar
    const { password, ...result } = user.toObject();
    return result;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Kullanıcı bilgilerini güncelle' })
  @ApiResponse({ status: 200, description: 'Kullanıcı güncellendi' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Kullanıcıyı sil' })
  @ApiResponse({ status: 200, description: 'Kullanıcı silindi' })
  async delete(@Param('id') id: string) {
    const deleted = await this.usersService.delete(id);
    return { success: deleted, message: deleted ? 'Kullanıcı silindi' : 'Kullanıcı bulunamadı' };
  }
}

