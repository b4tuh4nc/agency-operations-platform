import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { AdvertsModule } from './adverts/adverts.module';
import { ConceptNotesModule } from './concept-notes/concept-notes.module';
import { TasksModule } from './tasks/tasks.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { TicketsModule } from './tickets/tickets.module';
import { FileManagementModule } from './file-management/file-management.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PerformanceMonitoringModule } from './performance-monitoring/performance-monitoring.module';
import { StaffGradesModule } from './staff-grades/staff-grades.module';
import { SalariesModule } from './salaries/salaries.module';
import { AnnualBonusesModule } from './annual-bonuses/annual-bonuses.module';
import { UptimeModule } from './uptime/uptime.module';
import { ActivityLogInterceptor } from './common/interceptors/activity-log.interceptor';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/admanager_db'),
    AuthModule,
    UsersModule,
    ClientsModule,
    CampaignsModule,
    AdvertsModule,
    ConceptNotesModule,
    TasksModule,
    ActivityLogsModule,
    TicketsModule,
    FileManagementModule,
    InvoicesModule,
    PerformanceMonitoringModule,
    StaffGradesModule,
    SalariesModule,
    AnnualBonusesModule,
    UptimeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityLogInterceptor,
    },
  ],
})
export class AppModule {}
