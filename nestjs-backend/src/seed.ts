import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    const usersToCreate = [
      // Admin
      { email: 'admin@admanager.com', password: 'admin123', role: 'admin', firstName: 'Admin', lastName: 'User' },
      
      // Client - YENİ!
      { email: 'client1@example.com', password: 'client123', role: 'client', firstName: 'John', lastName: 'Client' },
      { email: 'client2@example.com', password: 'client123', role: 'client', firstName: 'Jane', lastName: 'Client' },
      
      // Administration
      { email: 'office.manager@admanager.com', password: 'demo123', role: 'office_manager', firstName: 'Sarah', lastName: 'Johnson' },
      { email: 'assistant@admanager.com', password: 'demo123', role: 'personal_assistant', firstName: 'Emily', lastName: 'Davis' },
      
      // Accounts
      { email: 'accountant@admanager.com', password: 'demo123', role: 'accountant', firstName: 'Michael', lastName: 'Brown' },
      { email: 'credit@admanager.com', password: 'demo123', role: 'credit_controller', firstName: 'David', lastName: 'Wilson' },
      
      // Creative - Management
      { email: 'director@admanager.com', password: 'demo123', role: 'director', firstName: 'James', lastName: 'Anderson' },
      { email: 'account.manager1@admanager.com', password: 'demo123', role: 'account_manager', firstName: 'Lisa', lastName: 'Martinez' },
      { email: 'account.manager2@admanager.com', password: 'demo123', role: 'account_manager', firstName: 'Robert', lastName: 'Taylor' },
      
      // Creative - Production
      { email: 'designer@admanager.com', password: 'demo123', role: 'graphic_designer', firstName: 'Jessica', lastName: 'Moore' },
      { email: 'photographer@admanager.com', password: 'demo123', role: 'photographer', firstName: 'Daniel', lastName: 'Lee' },
      { email: 'copywriter@admanager.com', password: 'demo123', role: 'copy_writer', firstName: 'Amanda', lastName: 'White' },
      { email: 'editor@admanager.com', password: 'demo123', role: 'editor', firstName: 'Chris', lastName: 'Harris' },
      
      // Computing
      { email: 'computer.manager@admanager.com', password: 'demo123', role: 'computer_manager', firstName: 'Kevin', lastName: 'Clark' },
      { email: 'support@admanager.com', password: 'demo123', role: 'network_support', firstName: 'Brian', lastName: 'Lewis' },
    ];

    for (const userData of usersToCreate) {
      const existing = await usersService.findByEmail(userData.email);
      if (!existing) {
        await usersService.create(userData);
        console.log('✅ Kullanıcı oluşturuldu:', userData.email, '-', userData.role);
      } else {
        console.log('ℹ️  Zaten mevcut:', userData.email);
      }
    }

  } catch (error) {
    console.error('❌ Seed işlemi başarısız:', error);
  } finally {
    await app.close();
  }
}

seed();
