import { IQuestion } from 'src/interfaces/Question.interface';

export interface CreateGameDto {
  questions: IQuestion[];
  userId: number;
}
