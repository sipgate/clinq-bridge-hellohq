import { Adapter, CallDirection, CallEvent, Config, Contact, ContactTemplate, ServerError } from "@clinq/bridge";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import * as encode64 from "base-64";
import { Request } from "express";
import * as querystring from "querystring";
import * as uuid from "uuid/v4";
import { API_BASE_URL, createClient } from "./api";
import { AuthResponse } from "./models/auth.model";
import { Company, CreateCompanyResponse, GetCompaniesResponse, UpdateCompanyResponse } from "./models/company.model";
import { ContactPersons, HelloHqContact } from "./models/contact.model";
import { HelloHqUser, MeUserResponse } from "./models/helloHqUser.model";
import { ContactHistoriesTemplate, ContactType } from "./models/history.model";
import { anonymizeKey, formatDuration, normalizePhoneNumber, parsePhoneNumber } from "./utils";
import { convertToClinqContact, convertToHelloHqContact } from "./utils/mapper";
import { parseEnvironment } from "./utils/parse-environments";
import * as moment from "moment";

const { clientId, redirectUri, clientSecret } = parseEnvironment();

export class HelloHqAdapter implements Adapter {
	public getOAuth2RedirectUrl(): Promise<string> {
		return Promise.resolve(
			`https://api.hqlabs.de/Account/Authorize?response_type=code&client_id=${clientId}&state=${uuid()}&redirect_uri=${encodeURIComponent(
				redirectUri
			)}&scope=${encodeURIComponent("read_all write_all")}`
		);
	}

	public async handleOAuth2Callback(req: Request): Promise<{ apiKey: string; apiUrl: string }> {
		const { code } = req.query;
		const formData = querystring.stringify({
			redirect_uri: redirectUri,
			grant_type: "authorization_code",
			code: code
		});

		const {
			data: { access_token, refresh_token }
		}: AxiosResponse = await axios.post<AuthResponse>(`${API_BASE_URL}/Token`, formData, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${encode64.encode(`${clientId}:${clientSecret}`)}`
			}
		});

		const resp = {
			apiKey: `${access_token}:${refresh_token}`,
			apiUrl: "",
			locale: ""
		};

		return resp;
	}

	public async getContacts(config: Config): Promise<Contact[]> {
		const anonKey = anonymizeKey(config.apiKey);
		const client = createClient(config);

		try {
			return this.paginate(anonKey, client, 0, []);
		} catch (error) {
			console.error(`Could not fetch contacts for key "${anonKey}: ${error.message}"`);
			throw new ServerError(400, "Could not fetch contacts");
		}
	}

	public async paginate(
		anonKey: string,
		client: AxiosInstance,
		skip: number,
		accumulated: Contact[]
	): Promise<Contact[]> {
		const { data } = await client.get<ContactPersons>(
			`/ContactPersons?$expand=DefaultAddress,Company&$orderby=Id asc&$count=true&$skip=${skip}`
		);

		const contacts = data.value.map(val => convertToClinqContact(val));
		const mergedContacts = [...accumulated, ...contacts];
		const fetchedContacts = mergedContacts.length;
		const more = Boolean(fetchedContacts < Number(data["@odata.count"]));

		console.log(`Fetched ${mergedContacts.length} contacts for key ${anonKey}`);

		return more ? this.paginate(anonKey, client, fetchedContacts, mergedContacts) : mergedContacts;
	}

	public async createContact(config: Config, newContact: ContactTemplate): Promise<Contact> {
		const anonKey = anonymizeKey(config.apiKey);
		const client = await createClient(config);
		let company = null;
		try {
			if (newContact.organization) {
				company = await this.getOrCreateCompany(anonKey, client, newContact.organization);
			}

			const helloHqContact = convertToHelloHqContact(newContact, company);
			const response: AxiosResponse = await client.post<ContactPersons>(
				"/ContactPersons?$expand=DefaultAddress,Company",
				helloHqContact
			);
			const { data } = response;

			const convertedContact: Contact = convertToClinqContact(data, company);
			console.log(`Created contact for ${anonKey}`);
			return convertedContact;
		} catch (error) {
			console.error(`Could not create contact for key "${anonKey}: ${error.message}"`);
			throw new ServerError(400, "Could not create contact");
		}
	}

	public async updateContact(config: Config, id: string, updatedContact: Contact): Promise<Contact> {
		const anonKey = anonymizeKey(config.apiKey);
		const client = await createClient(config);
		let company = null;

		try {
			if (updatedContact.organization) {
				company = await this.getOrCreateCompany(anonKey, client, updatedContact.organization);
			}

			const updatedHelloHqContact = convertToHelloHqContact(updatedContact, company);
			const response: AxiosResponse = await client.put<ContactPersons>(
				`/ContactPersons(${id})?$expand=DefaultAddress,Company`,
				updatedHelloHqContact
			);
			const { data } = response;

			const convertedContact: Contact = convertToClinqContact(data, company);
			console.log(`Updated contact for ${anonKey}`);
			return convertedContact;
		} catch (error) {
			console.error(`Could not update contact for key "${anonKey}: ${error.message}"`);
			throw new ServerError(400, "Could not update contact");
		}
	}

	public async deleteContact(config: Config, id: string): Promise<void> {
		const anonKey = anonymizeKey(config.apiKey);
		const client = await createClient(config);

		try {
			await client.delete<void>(`/ContactPersons(${id})`);
			console.log(`Deleted contact for ${anonKey}`);
		} catch (error) {
			console.error(`Could not delete contact for key "${anonKey}: ${error.message}"`);
			throw new ServerError(400, "Could not delete contact");
		}
	}

	public async handleCallEvent(config: Config, callEvent: CallEvent): Promise<void> {
		const { direction, from, to } = callEvent;
		const anonKey = anonymizeKey(config.apiKey);
		const phoneNumber = direction === CallDirection.IN ? from : to;

		try {
			const client = await createClient(config);
			const contact: HelloHqContact = await this.getContactByPhoneNumber(client, phoneNumber);

			if (!contact) {
				console.error(`Could not save CallEvent for ${phoneNumber} for key ${anonKey}`);
				return;
			}

			console.log(`Save CallEvent for ${anonKey}`);

			await this.createContactHistory(client, contact, callEvent, config.locale);
		} catch (error) {
			console.error(`Could not save CallEvent for ${phoneNumber} for key "${anonKey}: ${error.message}"`);
			throw new ServerError(400, "Could not save CallEvent");
		}
	}

	private async createContactHistory(
		client: AxiosInstance,
		contact: HelloHqContact,
		callEvent: CallEvent,
		locale: string
	): Promise<void> {
		const currentUser: HelloHqUser = await this.getCurrentUser(client);

		const history: ContactHistoriesTemplate = {
			ContactOn: new Date(Number(callEvent.start)).toISOString(),
			Content: this.parseCallComment(callEvent, locale),
			Subject: this.parseCallSubject(callEvent, locale),
			ContactType: locale === "de_DE" ? ContactType.TELEFON : ContactType.PHONE,
			UserId: currentUser.Id,
			CompanyId: contact.CompanyId ? contact.CompanyId : null,
			ContactPersonId: contact.Id
		};

		const response: AxiosResponse = await client.post("/ContactHistories", history);
	}

	private parseCallComment({ channel, start, end, direction }: CallEvent, locale: string): string {
		const date = moment(Number(start));
		const duration = formatDuration(Number(end) - Number(start));
		const isGerman = locale === "de_DE";

		const directionInfo =
			direction === CallDirection.IN ? (isGerman ? "Eingehender" : "Incoming") : isGerman ? "Ausgehender" : "Outgoing";

		const textEN = `<div><strong>${directionInfo}</strong> CLINQ call in <strong>"${
			channel.name
		}"</strong> on ${date.format("YYYY-MM-DD")} (${duration})<div>`;
		const textDE = `<div><strong>${directionInfo}</strong> CLINQ Anruf in <strong>"${
			channel.name
		}"</strong> am ${date.format("DD.MM.YYYY")} (${duration})<div>`;

		return isGerman ? textDE : textEN;
	}

	private parseCallSubject({ channel, direction }: CallEvent, locale: string): string {
		const isGerman = locale === "de_DE";
		const directionInfo =
			direction === CallDirection.IN ? (isGerman ? "Eingehender" : "Incoming") : isGerman ? "Ausgehender" : "Outgoing";
		const textEN = `${directionInfo} CLINQ call in "${channel.name}"`;
		const textDE = `${directionInfo} CLINQ Anruf in "${channel.name}"`;

		return isGerman ? textDE : textEN;
	}

	private async getCurrentUser(client: AxiosInstance): Promise<HelloHqUser> {
		const { data }: AxiosResponse<HelloHqUser> = await client.get<MeUserResponse>("/Me");
		return data;
	}

	private async getContactByPhoneNumber(client: AxiosInstance, phoneNumber: string): Promise<HelloHqContact> {
		try {
			const parsedPhoneNumber = parsePhoneNumber(phoneNumber);
			const filterString = `contains(PhoneLandline, '${phoneNumber}') or contains(PhoneMobile, '${phoneNumber}') or contains(PhoneLandline, '${
				parsedPhoneNumber.localized
			}') or contains(PhoneMobile, '${parsedPhoneNumber.localized}') or contains(PhoneLandline, '${
				parsedPhoneNumber.e164
			}') or contains(PhoneMobile, '${parsedPhoneNumber.e164}') or contains(PhoneLandline, '${normalizePhoneNumber(
				parsedPhoneNumber.e164
			)}') or contains(PhoneMobile, '${normalizePhoneNumber(parsedPhoneNumber.e164)}')`;

			const { data } = await client.get<ContactPersons>(
				`/ContactPersons?$expand=DefaultAddress,Company&$filter=${encodeURI(filterString)}`
			);

			if (!data.value.length) {
				console.error(`Cannot find contact for phone number ${phoneNumber}`);
			}
			const contact = data.value.find(Boolean);

			return contact;
		} catch (error) {
			console.error(`Cannot find contact for phone number ${phoneNumber}: ${error.message}"`);
			throw new ServerError(400, "Cannot find contact for phone number");
		}
	}

	private async getOrCreateCompany(anonKey: string, client: AxiosInstance, companyName: string): Promise<Company> {
		try {
			const { data: getCompaniesResponse }: AxiosResponse = await client.get<GetCompaniesResponse>(
				`/Companies?$filter=Name eq '${companyName}'`
			);
			const companies = getCompaniesResponse.value;

			if (companies.length) {
				console.log(`Found ${companies.length} companies with Name '${companyName}' for ${anonKey}`);
				const exactCompany = companies.find(Boolean);
				return exactCompany;
			}

			const { data: createdResponse }: AxiosResponse = await client.post<CreateCompanyResponse>("/Companies", {
				Name: companyName
			});
			console.log(`New company created for ${anonKey}`);
			return createdResponse;
		} catch (error) {
			console.error(`Could not create company for key "${anonKey}: ${error.message}"`);
			throw new ServerError(400, "Could not create company");
		}
	}

	private async updateCompany(
		anonKey: string,
		client: AxiosInstance,
		companyName: string,
		companyId: number
	): Promise<Company> {
		try {
			const { data: updateCompaniesResponse }: AxiosResponse = await client.put<UpdateCompanyResponse>(
				`/Companies(${companyId})`,
				{
					Name: companyName
				}
			);
			const company = updateCompaniesResponse.value;
			console.log(`Update company for ${anonKey}`);
			return company;
		} catch (error) {
			console.error(`Could not update company for key "${anonKey}: ${error.message}"`);
			throw new ServerError(400, "Could not update company");
		}
	}
}
