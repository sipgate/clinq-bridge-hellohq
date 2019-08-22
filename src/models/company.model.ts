export interface Company extends CompanyTemplate {
	IndustrialSector: string;
	Description: string;
	DebitorNumber: number;
	CreditorNumber: number;
	TaxId: string;
	DefaultDeliveryConditionId: number;
	DefaultPaymentConditionId: number;
	DefaultAddress: Address;
	Id: number;
	CreatedBy: number;
	UpdatedBy: number;
	CreatedOn: string;
	UpdatedOn: string;
}

export interface CompanyTemplate {
	Name: string;
}

export interface GetCompaniesResponse {
	data: {
		"@odata.context": string;
		value: Company[];
	};
}

export interface CreateCompanyResponse {
	"@odata.context": string;
	value: Company[];
}

export interface UpdateCompanyResponse extends CreateCompanyResponse {}

interface Address {
	City: string;
	Street: string;
	HouseNumber: string;
	ZipCode: string;
	AddressLine2: string;
	Description: string;
	Country: string;
	Phone: string;
	Fax: string;
	Email: string;
	Website: string;
	IsStandard: boolean;
	Id: number;
	CreatedBy: number;
	UpdatedBy: number;
	CreatedOn: string;
	UpdatedOn: string;
}
