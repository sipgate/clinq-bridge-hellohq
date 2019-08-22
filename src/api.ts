import { Config } from "@clinq/bridge";
import axios, { AxiosInstance } from "axios";

export const API_BASE_URL = "https://api.hqlabs.de";

export const createClient = (config: Config): AxiosInstance => {
	const token = config.apiKey.split(":")[0];
	return axios.create({
		baseURL: `${API_BASE_URL}/v1`,
		headers: { Authorization: `Bearer ${token}` }
	});
};
