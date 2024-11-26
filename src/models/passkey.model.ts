import { z } from "zod";

const Base64URLStringSchema = z.string();
const Uint8ArraySchema = z.string().transform((val) => {
    return Uint8Array.from(atob(val), (char) => char.charCodeAt(0));
});
const AuthenticatorTransportFutureSchema = z.enum([
    "ble",
    "cable",
    "hybrid",
    "internal",
    "nfc",
    "smart-card",
    "usb",
]);

export const PasskeySchema = z.object({
    id: Base64URLStringSchema,
    publicKey: Uint8ArraySchema,
    counter: z.number(),
    transports: z.array(AuthenticatorTransportFutureSchema).optional(),
});

// Types
export type AuthenticatorTransportFuture = z.infer<
    typeof AuthenticatorTransportFutureSchema
>;
export type Passkey = z.infer<typeof PasskeySchema>;
