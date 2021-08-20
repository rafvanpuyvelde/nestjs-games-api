import { HttpModule } from '@nestjs/axios';
import {
  CacheModule,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';

import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { AuthMiddleware } from './middleware/auth.middleware';

@Module({
  imports: [HttpModule, CacheModule.register()],
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule implements NestModule {
  constructor(private gamesService: GamesService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(GamesController);
  }
}
