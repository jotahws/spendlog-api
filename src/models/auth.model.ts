import {
    AuthenticationResponseJSON,
    RegistrationResponseJSON,
} from "@simplewebauthn/types";
import { z } from "zod";
import { User, UserSchema } from "./user.model.ts";

export const LoginSchema = z.object({
    email: z.string().email(),
    authResponse: z.any(),
});
export interface Login {
    email: string;
    authResponse: AuthenticationResponseJSON;
}

export const CompleteRegistrationSchema = z.object({
    user: UserSchema,
    registrationResponse: z.any(),
});
export interface CompleteRegistration {
    user: User;
    registrationResponse: RegistrationResponseJSON;
}

export const AuthenticateSchema = z.object({
    user: UserSchema,
    authenticationResponse: z.any(),
});
export interface Authenticate {
    user: User;
    authenticationResponse: AuthenticationResponseJSON;
}
