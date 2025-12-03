import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Habilita CORS para permitir acesso de outros serviços/Docker
  app.enableCors();

  // Prefixo global: http://localhost:3000/api/*
  app.setGlobalPrefix('api');

  const usersService = app.get(UsersService);

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPass = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPass) {
    console.warn(
      'ADMIN_EMAIL or ADMIN_PASSWORD not set, skipping default admin creation',
    );
  } else {
    const exists = await usersService.findByEmail(adminEmail);

    if (!exists) {
      console.log('Criando usuário admin padrão...');
      await usersService.create({
        email: adminEmail,
        password: adminPass,
        role: 'admin',
      });
    }
  }

  const port = process.env.PORT || 3000;

  await app.listen(port, '0.0.0.0');
  console.log(`Nest API rodando na porta ${port}`);
}

bootstrap();
