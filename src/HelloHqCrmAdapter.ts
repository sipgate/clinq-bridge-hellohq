import axios, { AxiosResponse } from "axios";
import { Request } from "express";
import { Adapter, Config, Contact, PhoneNumberLabel } from "@clinq/bridge";
import { parseEnvironment } from "./parse-environments";
import * as uuid from "uuid/v1";
import { format } from "url";
import * as querystring from "querystring";
import * as encode64 from "base-64";
import { AuthResponse, HelloHqContact } from "./types/hellohq";

let url = 'https://api.hqlabs.de/v1/ContactPersons';
const { clientId, redirectUri, clientSecret } = parseEnvironment();

function mapToClinqContact(contact: HelloHqContact): Contact {

	return {
		name: `${contact.FirstName} ${contact.LastName}`,
		firstName: contact.FirstName,
		lastName: contact.LastName,
		email: '',
		organization: '',
		id: String(contact.Id),
		contactUrl: null,
		avatarUrl: null,
		phoneNumbers: []
	};

}

export class HelloHqCrmAdapter implements Adapter {
	public async getContacts(config: Config): Promise<Contact[]> {

		const { data }: AxiosResponse = await axios.get<{ value: HelloHqContact[] }>(url, {
			headers: {
				'Authorization': `Bearer ${config.apiKey.split(':')[0]}`
			}
		});
		return data.value.map(mapToClinqContact);
	}

	public getOAuth2RedirectUrl(): Promise<string> {
		return Promise.resolve(`https://api.hqlabs.de/Account/Authorize?response_type=code&client_id=${clientId}&state=${uuid()}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent('read_all write_all')}`);
	}

	public async handleOAuth2Callback(req: Request): Promise<{ apiKey: string; apiUrl: string }> {
		const { code } = req.query;
		const formData = {
			'redirect_uri': redirectUri,
			'grant_type': 'authorization_code',
			'code': code
		}

		const { data: { access_token, refresh_token } }: AxiosResponse = await axios.post<AuthResponse>('https://api.hqlabs.de/Token',
			querystring.stringify(formData),
			{
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'Authorization': `Basic ${encode64.encode(`${clientId}:${clientSecret}`)}`
				}
			});

		const resp = {
			apiKey: `${access_token}:${refresh_token}`,
			apiUrl: '',
			locale: 'de'
		};

		return resp;
	}

}