import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Trust proxy for IP address
  app.set('trust proxy', true);

  // Static dosya servisi - uploads klasörü
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // CORS ayarları
  app.enableCors({
    origin: 'http://localhost:3001', // Frontend URL'i
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Swagger konfigürasyonu
  const config = new DocumentBuilder()
    .setTitle('NestJS Backend API')
    .setDescription('NestJS Backend API Dokümantasyonu')
    .setVersion('1.0')
    .addTag('auth', 'Kimlik doğrulama işlemleri')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Uygulama http://localhost:3000 adresinde çalışıyor`);
  console.log(`Swagger dokümantasyonu: http://localhost:3000/api`);
}
bootstrap();
