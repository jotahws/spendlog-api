import { z } from "zod";
import { PasskeySchema } from "./passkey.model.ts";

export const UserSchema = z.object({
    _id: z.string(),
    email: z.string().email(),
    passkeys: z.array(PasskeySchema).default([]),
    name: z.string().optional(),
    apiKeys: z.array(z.string()).default([]),
});

export type User = z.infer<typeof UserSchema>;

export const ApiKeysSchema = z.object({
    apiKeys: z.array(z.string()),
});

export type ApiKeys = z.infer<typeof ApiKeysSchema>;
