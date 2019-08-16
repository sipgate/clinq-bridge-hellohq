import { OAuth2Options } from "./model";

const {
	CLIENT_ID: clientId,
	CLIENT_APP_SECRET: clientSecret,
	REDIRECT_URI: redirectUri
} = process.env;

export function parseEnvironment(): OAuth2Options {
	if (!clientId) {
		throw new Error("Missing CLIENT_ID in environment.");
	}

	if (!clientSecret) {
		throw new Error("Missing CLIENT_SECRET in environment.");
	}

	if (!redirectUri) {
		throw new Error("Missing REDIRECT_URI in environment.");
	}

	return {
		clientId,
		clientSecret,
		redirectUri
	};
}