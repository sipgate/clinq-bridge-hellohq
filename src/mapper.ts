import { HelloHqContact } from "./model";
import { Contact } from "@clinq/bridge";


export function mapToClinqContact(contact: HelloHqContact): Contact {
	return {
		name: `${contact.FirstName} ${contact.LastName}`,
		firstName: contact.FirstName,
		lastName: contact.LastName,
		email: "",
		organization: "",
		id: String(contact.Id),
		contactUrl: null,
		avatarUrl: null,
		phoneNumbers: []
	};
}
