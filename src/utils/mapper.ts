import { HelloHqContact, HelloHqContactTemplate, CountryCodes } from "../models/contact.model";
import { Contact, PhoneNumberLabel, ContactTemplate } from "@clinq/bridge";
import { Company } from "../models/company.model";

export function convertToClinqContact(contact: HelloHqContact, company?: Company): Contact {
	let phoneNumbers = [];

	if (contact.PhoneLandline && contact.PhoneLandline !== "") {
		phoneNumbers.push({
			label: PhoneNumberLabel.WORK,
			phoneNumber: contact.PhoneLandline
		});
	}

	if (contact.PhoneMobile && contact.PhoneMobile !== "") {
		phoneNumbers.push({
			label: PhoneNumberLabel.MOBILE,
			phoneNumber: contact.PhoneMobile
		});
	}

	const organization = contact.Company && contact.Company.Name ? contact.Company.Name : company ? company.Name : null;

	return {
		name: `${contact.FirstName} ${contact.LastName}`,
		firstName: contact.FirstName,
		lastName: contact.LastName,
		email: contact.DefaultAddress && contact.DefaultAddress.Email ? contact.DefaultAddress.Email : null,
		organization,
		id: String(contact.Id),
		contactUrl: null,
		avatarUrl: null,
		phoneNumbers
	};
}

export function convertToHelloHqContact(contact: ContactTemplate, company?: Company): HelloHqContactTemplate {
	let helloHqContact: HelloHqContactTemplate = {
		FirstName: contact.firstName ? contact.firstName : null,
		LastName: contact.lastName ? contact.lastName : null,
		PhoneLandline: contact.phoneNumbers
			? contact.phoneNumbers.find(phoneNumber => phoneNumber.label === PhoneNumberLabel.WORK).phoneNumber
			: null,
		PhoneMobile: contact.phoneNumbers
			? contact.phoneNumbers.find(phoneNumber => phoneNumber.label === PhoneNumberLabel.MOBILE).phoneNumber
			: null
	};

	if (contact.email) {
		helloHqContact.DefaultAddress = {
			Email: contact.email ? contact.email : null,
			Phone: helloHqContact.PhoneLandline ? helloHqContact.PhoneLandline : helloHqContact.PhoneMobile,
			Country: CountryCodes.DE
		};
	}

	if (company) {
		helloHqContact.CompanyId = company.Id;
	}
	return helloHqContact;
}
