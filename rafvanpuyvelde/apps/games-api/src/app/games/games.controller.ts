import { Controller, Get } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamePlatform } from './interfaces/game.interface';

@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Get()
  test(): string {
    return 'This action returns all games';
  }

  @Get('platforms')
  async getPlatforms(): Promise<GamePlatform[]> {
    return await this.gamesService.getPlatforms();
  }
}
