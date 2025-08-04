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