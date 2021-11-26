import { Game } from '.prisma/client';
import { IQuestion } from './Question.interface';

export interface IGame extends Game {
  questions?: IQuestion[];
}
