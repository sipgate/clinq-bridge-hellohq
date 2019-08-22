export interface ContactHistories extends ContactHistoriesTemplate {
	ContactOn: string;
	Content: string;
	Subject: string;
	ContactType: ContactType;
	UserId: number;
	ProjectId: number;
	LeadId: number;
	CompanyId: number;
	ContactPersonId: number;
	Id: number;
	CreatedBy: number;
	UpdatedBy: number;
	CreatedOn: string;
	UpdatedOn: string;
}

export interface ContactHistoriesTemplate {
	ContactOn: string;
	Content: string;
	Subject: string;
	ContactType: ContactType;
	UserId: number;
	CompanyId: number;
	ContactPersonId: number;
}

export enum ContactType {
	TELEFON = "Telefon",
	PHONE = "Phone"
}
