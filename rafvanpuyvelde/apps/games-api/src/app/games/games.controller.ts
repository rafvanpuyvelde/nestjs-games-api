import { Controller, Get } from '@nestjs/common';
import { Observable } from 'rxjs';

import { GamesService } from './games.service';
import { Game, Platforms } from './interfaces/game.interface';

@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Get()
  getAll(): Observable<Game[]> {
    return this.gamesService.getAll({
      platforms: [Platforms.PC],
      startDate: 1625090400,
      endDate: 1627768800,
      sortBy: 'date',
      sortOrder: 'asc',
      limit: 5,
    });
  }
}
