import axios, { AxiosInstance } from "axios"
import { Config } from "@clinq/bridge";

export const API_BASE_URL = "https://api.hqlabs.de";

export const getHelloHqClient = (config: Config): AxiosInstance => {
	const token = config.apiKey.split(":")[0]
	return axios.create({
		baseURL: API_BASE_URL,
		headers: { Authorization: `Bearer ${token}` }
	})
};