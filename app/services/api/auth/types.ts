export interface SessionData {
  token: string;
  userId?: string;
  hasTokenExpired: boolean;
}

export interface LogInRequestBodyDTO {
  username: string;
  password?: string; // Optional for mocks
}

export interface LogInResponse {
  token: string;
  expiresAt: string;
  userId?: string;
  headers?: any;
}

export interface SignUpRequestBodyDTO {
  email: string;
  password?: string;
}
