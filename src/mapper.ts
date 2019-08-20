import { Contact, PhoneNumberLabel, Config } from "@clinq/bridge";
import { HelloHqContact, HelloHqCompany } from "./model";
import { getCompanyById } from "./api";

function mapPhoneNumber(number: string | null, label: PhoneNumberLabel) {
	return number
		? [
				{
					label,
					phoneNumber: number
				}
		  ]
		: [];
}

export async function mapToClinqContact(contact: HelloHqContact, company?: HelloHqCompany): Promise<Contact> {
	return {
		name: `${contact.FirstName} ${contact.LastName}`,
		firstName: contact.FirstName,
		lastName: contact.LastName,
		email: null,
		organization: company ? company.Name : null,
		id: String(contact.Id),
		contactUrl: null,
		avatarUrl: null,
		phoneNumbers: [
			...mapPhoneNumber(contact.PhoneMobile, PhoneNumberLabel.MOBILE),
			...mapPhoneNumber(contact.PhoneLandline, PhoneNumberLabel.WORK)
		]
	};
}
