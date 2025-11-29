import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { WeatherModule } from "./weather/weather.module";
//import { UsersModule } from "./users/users.module";
//import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRoot(process.env.MONGO_URI!),

    WeatherModule,
    //UsersModule,
    //AuthModule,
  ],
})
export class AppModule {}
