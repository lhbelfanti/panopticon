export interface SessionData {
    token: string;
    hasTokenExpired: boolean;
}

export interface LogInRequestBodyDTO {
    username: string;
    password?: string; // Optional for mocks
}

export interface LogInResponse {
    token: string;
    expiresAt: string;
    headers?: any;
}

export interface SignUpRequestBodyDTO {
    email: string;
    password?: string;
}
