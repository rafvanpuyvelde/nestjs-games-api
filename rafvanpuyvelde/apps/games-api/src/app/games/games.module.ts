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
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: 60,
    }),
  ],
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(GamesController);
  }
}
