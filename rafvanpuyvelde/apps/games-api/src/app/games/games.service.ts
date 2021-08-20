import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GamesService {
  constructor(private httpService: HttpService) {}
}
