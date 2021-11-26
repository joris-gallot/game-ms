import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
    PassportModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    JwtStrategy,
    {
      provide: 'GAME_SERVICE',
      inject: [ConfigService],
      useFactory: () =>
        ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RMQ_URL],
            queue: 'question_queue',
            queueOptions: {
              durable: false,
            },
          },
        }),
    },
  ],
})
export class AppModule {}
