// utils/telegramUtils.js
import crypto from "crypto";
import { GoogleAuth } from 'google-auth-library';

export function isTelegramDataValid(data, botToken) {

    const { hash, ...rest } = data;

    const dataCheckString = Object.keys(rest)
                                .sort()
                                .map((key) => `${key}=${rest[key]}`)
                                .join("\n");

    const secret = crypto
                    .createHash("sha256")
                    .update(botToken)
                    .digest();

    const computedHash = crypto
                            .createHmac("sha256", secret)
                            .update(dataCheckString)
                            .digest("hex");

    return computedHash === hash;
}

export async function getTeleBotIdTokenClient(url) {
    const auth = new GoogleAuth();

    try {
        console.log(`[getTeleBotIdTokenClient] Getting ID token client for: ${url}`);
        const client = await auth.getIdTokenClient(url);
        console.log(`[getTeleBotIdTokenClient] ID token client created successfully.`);
        return client;
    } catch (err) {
        console.error(`[getTeleBotIdTokenClient] Failed to get ID token client for ${url}`);
        console.error(err);
        throw new Error(`Could not get ID token client: ${err.message}`);
    }
}