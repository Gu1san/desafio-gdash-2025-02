import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita CORS para permitir acesso de outros serviços/Docker
  app.enableCors();

  // Prefixo global: http://localhost:3000/api/*
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;

  await app.listen(port, '0.0.0.0');
  console.log(`Nest API rodando na porta ${port}`);
}

bootstrap();
