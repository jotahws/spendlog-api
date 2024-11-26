import { Status, STATUS_TEXT } from "@oak/oak";
import type { RouterContext } from "@oak/oak/router";
import {
    generateAuthenticationOptions,
    GenerateAuthenticationOptionsOpts,
    generateRegistrationOptions,
    VerifiedRegistrationResponse,
    verifyAuthenticationResponse,
    VerifyAuthenticationResponseOpts,
    verifyRegistrationResponse,
    VerifyRegistrationResponseOpts,
} from "@simplewebauthn/server";
import {
    PublicKeyCredentialCreationOptionsJSON,
    WebAuthnCredential,
} from "@simplewebauthn/types";
import { throwError } from "../middleware/errorHandler.middleware.ts";
import { CompleteRegistration, Login } from "../models/auth.model.ts";
import { Passkey } from "../models/passkey.model.ts";
import { User, UserSchema } from "../models/user.model.ts";
import UserService from "../services/user.service.ts";

/**
 * Human-readable title for your website
 */
const rpName = "Spendlog API";
/**
 * A unique identifier for your website. 'localhost' is okay for
 * local dev
 */
const rpID = "localhost";
/**
 * The URL at which registrations and authentications should occur.
 * 'http://localhost' and 'http://localhost:PORT' are also valid.
 * Do NOT include any trailing /
 */
const expectedOrigin = `http://localhost`;

class AuthController {
    public static async initializeRegistration(
        { request, response, state }: RouterContext<string>,
    ) {
        console.info("Registering Passkey");
        const queryParams = Object.fromEntries(
            request.url.searchParams,
        );
        const user: User = UserSchema.parse(
            queryParams,
        );

        const userPasskeys: Passkey[] = user?.passkeys || [];

        const options: PublicKeyCredentialCreationOptionsJSON =
            await generateRegistrationOptions({
                rpName,
                rpID,
                userName: user.email,
                userDisplayName: user.name,
                attestationType: "none",
                excludeCredentials: userPasskeys.map((passkey) => ({
                    id: passkey.id,
                    transports: passkey.transports,
                })),
                authenticatorSelection: {
                    residentKey: "preferred",
                    userVerification: "preferred",
                    authenticatorAttachment: "platform",
                },
            });
        // Store the challenge in session
        state.session.challenge = options.challenge;
        response.status = Status.PartialContent;
        console.log("options", options);

        response.body = options;
    }

    public static async completeRegistration(
        { request, response, state }: RouterContext<string>,
    ) {
        console.info("Confirming Registration");
        const { user, registrationResponse }: CompleteRegistration =
            await request.body.json();
        const email = user.email;
        const expectedChallenge = state.session.challenge;
        console.log(expectedChallenge);

        if (!expectedChallenge) {
            throwError({
                status: Status.BadRequest,
                name: "Confirm Registration",
                path: "auth.controller.ts",
                message: `Challenge not found for ${email}`,
                type: STATUS_TEXT[Status.BadRequest],
            });
        }

        let verification: VerifiedRegistrationResponse;
        try {
            const opts: VerifyRegistrationResponseOpts = {
                response: registrationResponse,
                expectedChallenge: `${expectedChallenge}`,
                expectedOrigin,
                expectedRPID: rpID,
                requireUserVerification: false,
            };
            verification = await verifyRegistrationResponse(opts);
            const { verified, registrationInfo } = verification;
            if (verified && registrationInfo) {
                const { credential } = registrationInfo;

                const newCredential: WebAuthnCredential = {
                    id: credential.id,
                    publicKey: credential.publicKey,
                    counter: credential.counter,
                    transports: registrationResponse.response.transports,
                };
                user.passkeys.push(newCredential);
            }

            state.session.challenge = undefined;
            response.body = { verified };
        } catch (error) {
            throwError({
                status: Status.BadRequest,
                name: "Confirm Registration",
                path: "auth.controller.ts",
                message: `Error verifying registration response: ${error}`,
                type: STATUS_TEXT[Status.BadRequest],
            });
        }
        response.body = await UserService.insert(user);
        response.status = Status.Created;
    }

    public static async getAuthenticationOptions(
        { request, response, state }: RouterContext<string>,
    ) {
        console.info("Getting Passkeys");
        const queryParams = Object.fromEntries(
            request.url.searchParams,
        );
        const email: string = queryParams.email;

        const user = await UserService.getByEmail(email);
        const passkeys = user?.passkeys || [];

        const opts: GenerateAuthenticationOptionsOpts = {
            timeout: 60000,
            allowCredentials: passkeys.map((cred) => ({
                id: cred.id,
                type: "public-key",
                transports: cred.transports,
            })),
            userVerification: "preferred",
            rpID,
        };

        const options = await generateAuthenticationOptions(opts);

        // Store the challenge in session
        state.session.challenge = options.challenge;
        response.status = Status.PartialContent;
        response.body = options;
    }

    public static async completeAuthentication(
        { request, response, state }: RouterContext<string>,
    ) {
        console.info("Authenticating");
        const { email, authResponse }: Login = await request.body.json();
        const expectedChallenge = state.session.challenge;

        let dbCredential: WebAuthnCredential | undefined;
        const user = await UserService.getByEmail(email);
        for (const cred of user?.passkeys || []) {
            if (cred.id === authResponse.id) {
                dbCredential = cred;
                break;
            }
        }

        if (!dbCredential) {
            throwError({
                status: Status.BadRequest,
                name: "Authentication Error",
                path: "auth.controller.ts",
                message: `Authenticator is not registered with this site`,
                type: STATUS_TEXT[Status.BadRequest],
            });
        } else {
            try {
                const opts: VerifyAuthenticationResponseOpts = {
                    response: authResponse,
                    expectedChallenge: `${expectedChallenge}`,
                    expectedOrigin,
                    expectedRPID: rpID,
                    credential: dbCredential,
                    requireUserVerification: false,
                };
                const { verified, authenticationInfo } =
                    await verifyAuthenticationResponse(opts);

                if (verified) {
                    dbCredential.counter = authenticationInfo.newCounter;
                    await UserService.updatePasskey(email, dbCredential);
                }

                state.session.challenge = undefined;
                response.body = { verified };
            } catch (error) {
                throwError({
                    status: Status.BadRequest,
                    name: "Authentication Error",
                    path: "auth.controller.ts",
                    message:
                        `Error verifying authentication response: ${error}`,
                    type: STATUS_TEXT[Status.BadRequest],
                });
            }
        }
        response.status = Status.OK;
    }
}

export default AuthController;
