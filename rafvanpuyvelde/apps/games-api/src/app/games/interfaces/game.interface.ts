export interface GameAuthentication {
  access_token?: string;
  expires_in?: number;
  issued_at?: number;
  token_type?: string;
  client_id?: string;
}

// IGDB game interfaces
export interface IgdbRelease {
  id: number;
  date: number;
  game: IgdbGame;
}

export interface IgdbGame {
  id: number;
  name: string;
  cover: IgdbCover;
  total_rating: number;
}

export interface IgdbCover {
  id: number;
  url: string;
}

// Custom game interfaces
export interface Game {
  id: number;
  name: string;
  thumbnail: string;
  release: number;
  rating: number;
}

export interface ReleaseConfig {
  platforms: Platforms[];
  startDate: number;
  endDate: number;
  sortBy: 'name' | 'date';
  sortOrder: 'asc' | 'desc';
  limit?: number;
}

// Enums
export enum Platforms {
  ALL = -1,
  PC = 6,
  XBOX_SERIES = 169,
  PLAYSTATION_5 = 167,
  NINTENDO_SWITCH = 130,
  STADIA = 170,
  XBOX_ONE = 49,
}
