import { Controller, Get, Query } from '@nestjs/common';
import { Observable } from 'rxjs';

import { GamesService } from './games.service';
import { Game, Platforms } from './interfaces/game.interface';
import { enumToDict } from '@rafvanpuyvelde/util';
import { ReleaseConfigDto } from './dto/release-config.dto';

@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Get()
  getAll(@Query() query: ReleaseConfigDto): Observable<Game[]> {
    const { platforms, startDate, endDate, sortBy, sortOrder, limit } = query;

    const platformDict = enumToDict(Platforms);
    const parsedPlatforms = platforms
      .split(',')
      .map((p) => parseInt(platformDict.get(p).toString()));

    return this.gamesService.getAll({
      platforms: parsedPlatforms,
      startDate: parseInt(startDate),
      endDate: parseInt(endDate),
      sortBy: sortBy === 'date' ? 'date' : 'name',
      sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
      limit: parseInt(limit),
    });
  }
}
