import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Game } from '@prisma/client';
import { lastValueFrom } from 'rxjs';
import { CreateGameDto } from './dto/CreateGameDto.interface';
import { SaveScoreDto } from './dto/SaveAnswersDto.interface';
import { IGame } from './interfaces/Game.interface';
import { IQuestion } from './interfaces/Question.interface';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    @Inject('GAME_SERVICE') private questionClient: ClientProxy,
  ) {}

  async createGame({ userId, questions }: CreateGameDto): Promise<Game> {
    const createdGame = await this.prisma.game.create({
      data: { userId, score: 0 },
    });

    await this.prisma.gameQuestions.createMany({
      data: questions.map((q) => ({
        questionId: q._id,
        gameId: createdGame.id,
      })),
    });

    return createdGame;
  }

  async saveScore({ gameId, score }: SaveScoreDto) {
    return this.prisma.game.update({
      where: {
        id: Number(gameId),
      },
      data: { score },
    });
  }

  async getHistory(userId: number): Promise<IGame[]> {
    const games: IGame[] = await this.prisma.game.findMany({
      where: { userId },
    });

    for (const game of games) {
      game.questions = [];

      const gameQuestionsLinks = await this.prisma.gameQuestions.findMany({
        where: {
          gameId: game.id,
        },
      });

      for (const gameQuestionsLink of gameQuestionsLinks) {
        const question$ = this.questionClient.send<IQuestion>(
          { cmd: 'GET_QUESTION' },
          gameQuestionsLink.questionId,
        );

        const question = await lastValueFrom(question$);

        game.questions?.push(question);
      }
    }

    return games;
  }
}
