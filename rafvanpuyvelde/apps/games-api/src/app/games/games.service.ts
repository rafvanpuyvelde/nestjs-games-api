import { HttpService } from '@nestjs/axios';
import {
  Inject,
  Injectable,
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Cache } from 'cache-manager';

import { GameAuthentication, GamePlatform } from './interfaces/game.interface';

@Injectable()
export class GamesService {
  private CLIENT_ID = process.env['CLIENT_ID'];

  constructor(
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  private async getTwitchRequestConfig() {
    const gameAuth: GameAuthentication | null = await this.cacheManager.get(
      'game-auth'
    );

    if (!gameAuth)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

    return {
      headers: {
        'Client-ID': this.CLIENT_ID,
        Authorization: `Bearer ${gameAuth?.access_token}`,
      },
    };
  }

  async getPlatforms(): Promise<GamePlatform[]> {
    const platforms = await this.httpService
      .post(
        'https://api.igdb.com/v4/platforms',
        'fields abbreviation,name;sort name asc;limit 500;',
        await this.getTwitchRequestConfig()
      )
      .toPromise();

    return platforms.data;
  }
}
