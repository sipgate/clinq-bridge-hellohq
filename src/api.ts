import { Config } from "@clinq/bridge";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { HelloHqCompany, HelloHqContact, ApiListResponse } from "./model";

export const API_BASE_URL = "https://api.hqlabs.de";

export const getHelloHqClient = (config: Config): AxiosInstance => {
	const token = config.apiKey.split(":")[0];
	return axios.create({
		baseURL: API_BASE_URL,
		headers: { Authorization: `Bearer ${token}` }
	});
};

export const getContacts = async (config: Config): Promise<HelloHqContact[]> => {
	const {
		data: { value }
	} = await getHelloHqClient(config).get<ApiListResponse<HelloHqContact>>("/v1/ContactPersons");
	return value;
};

export const getCompanyById = async (config: Config, id: string): Promise<HelloHqCompany> => {
	const { data } = await getHelloHqClient(config).get<HelloHqCompany>(`/v1/Companies(${id})`);
	return data;
};

export const getCompanies = async (config: Config): Promise<HelloHqCompany[]> => {
	const {
		data: { value }
	}: AxiosResponse = await getHelloHqClient(config).get<ApiListResponse<HelloHqCompany>>(`/v1/Companies`);
	return value;
};
