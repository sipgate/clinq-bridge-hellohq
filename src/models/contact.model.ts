import { Company } from "./company.model";

export interface HelloHqContact extends HelloHqContactTemplate {
	Position: string;
	Salutation: string;
	SalutationForm: string;
	Title: string;
	Language: string;
	DefaultAddressId: number;
	CompanyId: number;
	Company: Company;
	Id: number;
	CreatedBy: number;
	UpdatedBy: number;
	CreatedOn: string;
	UpdatedOn: string;
}

export interface HelloHqContactTemplate {
	FirstName: string;
	LastName: string;
	PhoneLandline: string;
	PhoneMobile: string;
	Addresses?: AddressTemplate[];
	DefaultAddress?: AddressTemplate;
	CompanyId?: number;
}

export interface ContactPersons {
	"@odata.count": number;
	value: HelloHqContact[];
}

export interface ContactPerson extends HelloHqContact {
	"@odata.context": string;
}

export interface AddressTemplate {
	Email: string;
	Country: string;
	Phone?: string;
}

export enum CountryCodes {
	DE = "DE",
	US = "US",
	GB = "GB"
}

interface Address extends AddressTemplate {
	Id: number;
	City: string;
	Street: string;
	HouseNumber: string;
	ZipCode: string;
	AddressLine2: string;
	Description: string;
	IsStandard: boolean;
	Fax: string;
	Website: string;
	CreatedBy: number;
	UpdatedBy: number;
	CreatedOn: string;
	UpdatedOn: string;
}
