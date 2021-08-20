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

  async use(req: Request, _res: Response, next: NextFunction) {
    const unavailableException = new HttpException(
      'Service Unavailable',
      HttpStatus.SERVICE_UNAVAILABLE
    );

    // Check if there is a valid cached token
    let gameAuth: GameAuthentication | null = await this.cacheManager.get(
      'game-auth'
    );

    // Get a token if there aren't any
    if (!gameAuth) {
      console.log('Fetched token.');

      try {
        const { data } = await this.getToken().toPromise();

        if (data) {
          const credentials = data as GameAuthentication;
          this.cacheCredentials(credentials);
          gameAuth = { ...credentials, issued_at: Date.now() };
        } else {
          throw unavailableException;
        }
      } catch (error) {
        throw unavailableException;
      }
    }

    if (gameAuth?.access_token && this.tokenIsStillValid(gameAuth)) {
      // Apply the token to the current request
      req.headers = {
        ...req.headers,
        'Client-ID': this.CLIENT_ID,
        Authorization: `Bearer ${gameAuth?.access_token}`,
      };
    } else {
      throw unavailableException;
    }

    next();
  }
}
