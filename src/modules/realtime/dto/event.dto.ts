import { Allow, MinLength } from 'class-validator';

export class EventDto {
  @Allow()
  test: string;
}
