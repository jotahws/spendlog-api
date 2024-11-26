import { Router } from "@oak/oak/router";
import AuthController from "../controllers/auth.controller.ts";
import { sessionMiddleware } from "../middleware/session.middleware.ts";
import {
    validateBody,
    validateQueryParams,
} from "../middleware/validate.middleware.ts";
import {
    AuthenticateSchema,
    CompleteRegistrationSchema,
} from "../models/auth.model.ts";
import { UserSchema } from "../models/user.model.ts";

const authRouter = new Router();

authRouter.get(
    "/auth/passkey/register",
    sessionMiddleware,
    validateQueryParams(UserSchema),
    AuthController.initializeRegistration,
);
authRouter.post(
    "/auth/register",
    sessionMiddleware,
    validateBody(CompleteRegistrationSchema),
    AuthController.completeRegistration,
);
authRouter.get(
    "/auth/passkey/get",
    sessionMiddleware,
    validateQueryParams(UserSchema),
    AuthController.getAuthenticationOptions,
);
authRouter.post(
    "/auth/login",
    sessionMiddleware,
    validateBody(AuthenticateSchema),
    AuthController.completeAuthentication,
);

export default authRouter;
