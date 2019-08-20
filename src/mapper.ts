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

export function mapToClinqContact(contact: HelloHqContact, company?: HelloHqCompany): Contact {
	const { FirstName, LastName, Id, PhoneMobile, PhoneLandline } = contact;

	const name = `${FirstName ? `${FirstName} ` : ""}${LastName ? LastName : ""}` || null;

	return {
		name,
		firstName: FirstName || null,
		lastName: LastName || null,
		email: null,
		organization: company ? company.Name : null,
		id: String(Id),
		contactUrl: null,
		avatarUrl: null,
		phoneNumbers: [
			...mapPhoneNumber(PhoneMobile, PhoneNumberLabel.MOBILE),
			...mapPhoneNumber(PhoneLandline, PhoneNumberLabel.WORK)
		]
	};
}
