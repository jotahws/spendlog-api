import { Router } from "@oak/oak/router";
import UserController from "../controllers/user.controller.ts";
import {
    CreateUserRequestSchema,
    UpdateUserRequestSchema,
    UserKeysIdRequestSchema,
} from "../dto/user.dto.ts";
import { validateApiKey } from "../middleware/session.middleware.ts";
import {
    validateBody,
    validateRouteParams,
} from "../middleware/validate.middleware.ts";

const userRouter = new Router();

userRouter.post(
    "/user",
    validateBody(CreateUserRequestSchema),
    UserController.create,
);
userRouter.get(
    "/user",
    validateApiKey,
    UserController.get,
);
userRouter.patch(
    "/user",
    validateApiKey,
    validateBody(UpdateUserRequestSchema),
    UserController.update,
);
userRouter.delete(
    "/user",
    validateApiKey,
    UserController.remove,
);

//API KEYS
userRouter.post(
    "/user/keys",
    validateApiKey,
    UserController.createApiKey,
);
userRouter.get(
    "/user/keys",
    validateApiKey,
    UserController.getApiKeys,
);
userRouter.delete(
    "/user/keys/:keyId",
    validateApiKey,
    validateRouteParams(UserKeysIdRequestSchema),
    UserController.removeApiKey,
);

export default userRouter;
