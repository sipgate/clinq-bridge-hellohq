import { Adapter, Config, Contact } from "@clinq/bridge";
import axios, { AxiosResponse } from "axios";
import * as encode64 from "base-64";
import { Request } from "express";
import * as querystring from "querystring";
import * as uuid from "uuid/v4";
import { parseEnvironment } from "./parse-environments";
import { AuthResponse, HelloHqContact, ContactPersons } from "./model";
import { mapToClinqContact } from "./mapper";
import { getHelloHqClient, API_BASE_URL } from "./api";

const { clientId, redirectUri, clientSecret } = parseEnvironment();

export class HelloHqCrmAdapter implements Adapter {
	public async getContacts(config: Config): Promise<Contact[]> {
		const { data }: AxiosResponse = await getHelloHqClient(config).get<ContactPersons>("/v1/ContactPersons");
		return data.value.map(mapToClinqContact);
	}

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
}
