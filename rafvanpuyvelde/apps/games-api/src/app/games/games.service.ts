import { HttpService } from '@nestjs/axios';
import {
  Inject,
  Injectable,
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Observable, from } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

import { GameAuthentication, GamePlatform } from './interfaces/game.interface';

@Injectable()
export class GamesService {
  private CLIENT_ID = process.env['CLIENT_ID'];

  constructor(
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  private getTwitchRequestConfig() {
    const gameAuth$: Observable<GameAuthentication> = from(
      this.cacheManager.get('game-auth')
    );

    return gameAuth$.pipe(
      map((auth) => {
        if (auth?.access_token) {
          return {
            headers: {
              'Client-ID': this.CLIENT_ID,
              Authorization: `Bearer ${auth?.access_token}`,
            },
          };
        } else throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      })
    );
  }

  getPlatforms(): Observable<GamePlatform[]> {
    return this.getTwitchRequestConfig().pipe(
      concatMap((config) =>
        this.httpService
          .post(
            'https://api.igdb.com/v4/platforms',
            'fields abbreviation,name;sort name asc;limit 500;',
            config
          )
          .pipe(map((res) => res.data as GamePlatform[]))
      )
    );
  }
}
