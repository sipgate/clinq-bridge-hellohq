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

export interface UserResponse {
	"@odata.count": number;
	value: HelloHqUser[];
}
