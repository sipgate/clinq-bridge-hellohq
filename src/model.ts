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

export interface HelloHqContact {
	FirstName: string;
	LastName: string;
	Position: string;
	CompanyId: number;
	PhoneLandline: string;
	PhoneMobile: string;
	Salutation: string;
	SalutationForm: string;
	Title: string;
	Language: string;
	DefaultAddressId: number;
	Id: number;
	CreatedBy: number;
	UpdatedBy: number;
	CreatedOn: string;
	UpdatedOn: string;
}

export interface ContactPersons {
	value: HelloHqContact[];
}
