import { z } from "zod";
import { UserSchema } from "../models/user.model.ts";

export const UserIdRequestSchema = z.object({
    id: z.string(),
});

export const CreateUserRequestSchema = UserSchema.omit({
    _id: true,
    passkeys: true,
    apiKeys: true,
}).strict();

export const UpdateUserRequestSchema = UserSchema.omit({
    _id: true,
    passkeys: true,
    apiKeys: true,
}).extend({
    email: z.string().email().optional(),
}).strict();

export const UserKeysIdRequestSchema = z.object({
    keyId: z.string(),
});
