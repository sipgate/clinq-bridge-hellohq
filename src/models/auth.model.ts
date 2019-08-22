export interface OAuth2Options {
	clientId: string;
	clientSecret: string;
	redirectUri: string;
}

export interface AuthResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	user_name: string;
	user_id: number;
}
