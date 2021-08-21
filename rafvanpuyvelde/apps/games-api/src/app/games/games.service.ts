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

import {
  GameAuthentication,
  Game,
  IgdbRelease,
  Platforms,
  ReleaseConfig,
} from './interfaces/game.interface';

@Injectable()
export class GamesService {
  private API = 'https://api.igdb.com/v4';
  private CLIENT_ID = process.env['CLIENT_ID'];

  constructor(
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  private getTwitchRequestHeaders() {
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

  private getReleasePlatformsQuery(platforms: Platforms[]): string {
    return platforms
      .map((platform) => `game.platforms = ${platform}`)
      .join(' & ');
  }

  private getReleaseQuery(config: ReleaseConfig) {
    const {
      platforms,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      limit = 5,
    } = config;

    const platformQuery = this.getReleasePlatformsQuery(platforms);
    const dateQuery = `date >= ${startDate} & date <= ${endDate}`;

    return `
      fields id,game.name,game.cover.url,date;
      where ${platformQuery} & ${dateQuery};
      sort ${sortBy} ${sortOrder};
      limit ${limit};
    `;
  }

  getAll(query: ReleaseConfig): Observable<Game[]> {
    return this.getTwitchRequestHeaders().pipe(
      concatMap((headers) =>
        this.httpService
          .post(
            `${this.API}/release_dates`,
            this.getReleaseQuery(query),
            headers
          )
          .pipe(
            map((res) =>
              (res.data as IgdbRelease[]).map((release) => ({
                id: release.game.id,
                name: release.game.name,
                thumbnail: `https:${release.game.cover.url}`,
                release: release.date,
              }))
            )
          )
      )
    );
  }
}
