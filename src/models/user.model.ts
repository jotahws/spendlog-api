import { z } from "zod";
import { PasskeySchema } from "./passkey.model.ts";

export const UserSchema = z.object({
    _id: z.string().optional(),
    email: z.string().email(),
    passkeys: z.array(PasskeySchema).default([]),
    name: z.string().optional(),
    apiKeys: z.array(z.string()).optional(),
});

export type User = z.infer<typeof UserSchema>;
