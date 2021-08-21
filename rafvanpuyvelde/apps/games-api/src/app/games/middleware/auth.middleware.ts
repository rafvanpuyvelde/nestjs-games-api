import { HttpService } from '@nestjs/axios';
import {
  Inject,
  Injectable,
  NestMiddleware,
  CACHE_MANAGER,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Request, Response, NextFunction } from 'express';
import { throwError } from 'rxjs';
import { map } from 'rxjs/operators';

import { GameAuthentication } from '../interfaces/game.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private CLIENT_ID = process.env['CLIENT_ID'];
  private CLIENT_SECRET = process.env?.['CLIENT_SECRET'];

  constructor(
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  private getToken() {
    if (!this.CLIENT_ID || !this.CLIENT_SECRET)
      throw new Error('No credentials provided');

    return this.httpService.post(
      'https://id.twitch.tv/oauth2/token',
      {},
      {
        params: {
          client_id: this.CLIENT_ID,
          client_secret: this.CLIENT_SECRET,
          grant_type: 'client_credentials',
        },
      }
    );
  }

  private cacheCredentials(credentials: GameAuthentication) {
    if (
      credentials?.access_token &&
      credentials?.expires_in &&
      credentials?.token_type
    ) {
      this.cacheManager.set(
        'game-auth',
        {
          access_token: credentials.access_token,
          expires_in: credentials.expires_in,
          issued_at: Date.now(),
          token_type: credentials.token_type,
          client_id: this.CLIENT_ID,
        },
        {
          ttl: credentials.expires_in - 5 * 60000,
        }
      );
    } else {
      throw throwError('Unable to retrieve auth token');
    }
  }

  private tokenIsStillValid(gameAuth: GameAuthentication): boolean {
    return (
      (gameAuth?.issued_at ?? Date.now()) +
        (gameAuth?.expires_in ?? Date.now()) >=
      Date.now()
    );
  }

  async use(_req: Request, _res: Response, next: NextFunction) {
    // Check if there is a valid cached token
    const gameAuth: GameAuthentication = await this.cacheManager.get(
      'game-auth'
    );

    // Get a token if there isn't one or if it's expired
    if (!gameAuth || !this.tokenIsStillValid(gameAuth)) {
      this.getToken()
        .pipe(map((res) => res.data as GameAuthentication))
        .subscribe(
          (credentials) => {
            if (credentials) this.cacheCredentials(credentials);
          },
          () => {
            throw new HttpException(
              'Service Unavailable',
              HttpStatus.SERVICE_UNAVAILABLE
            );
          },
          () => {
            console.log('[DEBUG] Fetched token');
            next();
          }
        );
    } else next();
  }
}
