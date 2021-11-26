import { Controller, Get, UseGuards } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Game } from '@prisma/client';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CreateGameDto } from './dto/CreateGameDto.interface';
import { IGame } from './interfaces/Game.interface';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @MessagePattern({ cmd: 'CREATE_GAME' })
  async createGame(payload: CreateGameDto): Promise<Game> {
    return this.appService.createGame(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  getHistory(): Promise<IGame[]> {
    return this.appService.getHistory(1);
  }
}
