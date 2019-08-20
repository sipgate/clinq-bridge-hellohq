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

export interface HelloHqCompany {
	"@odata.context": string;
	Name: string;
	IndustrialSector: string;
	Description: string;
	DebitorNumber: null;
	CreditorNumber: null;
	TaxId: string;
	DefaultDeliveryConditionId: number;
	DefaultPaymentConditionId: number;
	Id: number;
	CreatedBy: number;
	UpdatedBy: number;
	CreatedOn: string;
	UpdatedOn: string;
}

export interface ApiListResponse<T> {
	"@odata.context": string;
	value: Array<T>;
}
