import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherModule } from './weather/weather.module';
import { HealthModule } from './health/health.module';
//import { UsersModule } from "./users/users.module";
//import { AuthModule } from "./auth/auth.module";
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    HealthModule,
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRoot(
      process.env.MONGO_URI! || 'mongodb://localhost:27017/weatherdb',
    ),

    WeatherModule,

    UsersModule,

    AuthModule,
    //UsersModule,
    //AuthModule,
  ],
})
export class AppModule {}
