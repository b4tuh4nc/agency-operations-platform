import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ActivityType } from '../activity-logs/activity-log.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private activityLogsService: ActivityLogsService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await this.usersService.validatePassword(password, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Geçersiz email veya şifre');
    }
    
    // Last login zamanını güncelle
    await this.usersService.updateLastLogin(user._id);
    
    // Login activity log oluştur
    try {
      await this.activityLogsService.log(
        user._id.toString(),
        ActivityType.LOGIN,
        `${user.email} sisteme giriş yaptı`,
        'auth',
        undefined,
        { ipAddress, userAgent }
      );
    } catch (err) {
      console.error('Login activity log error:', err);
      // Log hatası login'i engellemesin
    }
    
    const payload = { email: user.email, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      message: 'Login successful'
    };
  }

  async logout(userId: string, ipAddress?: string, userAgent?: string) {
    try {
      await this.activityLogsService.log(
        userId,
        ActivityType.LOGOUT,
        `Kullanıcı sistemden çıkış yaptı`,
        'auth',
        undefined,
        { ipAddress, userAgent }
      );
      
      // Last logout zamanını güncelle
      await this.usersService.updateLastLogout(userId);
      
      return { message: 'Logout successful' };
    } catch (err) {
      console.error('Logout activity log error:', err);
      return { message: 'Logout successful' };
    }
  }
}
