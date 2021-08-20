export interface GameAuthentication {
  access_token?: string;
  expires_in?: number;
  issued_at?: number;
  token_type?: string;
  client_id?: string;
}

export interface GamePlatform {
  id: number;
  name: string;
}
