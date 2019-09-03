export interface HelloHqUser {
	FirstName: string;
	LastName: string;
	UserName: string;
	EMailWork: string;
	Salutation: string;
	Title: string;
	BirthDate: string;
	Id: number;
	CreatedBy: number;
	UpdatedBy: number;
	CreatedOn: string;
	UpdatedOn: string;
}

export interface MeUserResponse extends HelloHqUser {
	"@odata.context": string;
}
