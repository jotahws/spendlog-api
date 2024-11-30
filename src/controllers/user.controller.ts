import { Status, STATUS_TEXT } from "@oak/oak";
import type { RouterContext } from "@oak/oak/router";
import { throwError } from "../middleware/errorHandler.middleware.ts";
import { User } from "../models/user.model.ts";
import UserService from "../services/user.service.ts";

class UserController {
    public static async create({ request, response }: RouterContext<string>) {
        const user: User = await request.body.json();
        console.info("Creating User");
        const userWithApiKey = {
            ...user,
            apiKeys: [crypto.randomUUID()],
        };
        response.body = await UserService.insert(userWithApiKey);
        response.status = Status.Created;
    }

    public static get(
        { response, state }: RouterContext<string>,
    ) {
        const user: User = state.user;
        console.info(`Fetching User with ID: ${user._id}`);
        if (!user) {
            throwError({
                status: Status.NotFound,
                name: "User Not Found",
                path: "user.controller.get",
                message: `User not found`,
                type: STATUS_TEXT[Status.NotFound],
            });
        }
        response.body = user;
        response.status = Status.OK;
    }

    public static async update(
        { request, response, state }: RouterContext<string>,
    ) {
        const { _id }: User = state.user;
        const body: User = await request.body.json();
        console.info(`Updating User with ID: ${_id}`);
        const updatedUser = await UserService.update(_id, body);
        if (!updatedUser) {
            throwError({
                status: Status.NotFound,
                name: "Nothing to update",
                path: "user.controller.update",
                message: `User not found, or no values changed`,
                type: STATUS_TEXT[Status.NotFound],
            });
        }
        response.body = updatedUser;
        response.status = Status.OK;
    }

    public static async remove({ state, response }: RouterContext<string>) {
        const { _id }: User = state.user;
        console.info(`Deleting User with ID: ${_id}`);
        const deleted = await UserService.delete(_id);
        if (!deleted) {
            throwError({
                status: Status.NotFound,
                name: "User Not Deleted",
                path: "user.controller.delete",
                message: `User ${_id} does not exist`,
                type: STATUS_TEXT[Status.NotFound],
            });
        }
        response.status = Status.NoContent;
    }

    //API Keys
    public static async createApiKey(
        { response, state }: RouterContext<string>,
    ) {
        const { _id }: User = state.user;
        console.info(`Creating API Key for User with ID: ${_id}`);
        const apiKeys = await UserService.createApiKey(_id);
        response.body = apiKeys;
        response.status = Status.Created;
    }

    public static async getApiKeys(
        { state, response }: RouterContext<string>,
    ) {
        const { _id }: User = state.user;
        console.info(`Fetching API Keys for User with ID: ${_id}`);
        const apiKeys = await UserService.getApiKeys(_id);
        response.body = apiKeys;
        response.status = Status.OK;
    }

    public static async removeApiKey(
        { params, response, state }: RouterContext<string>,
    ) {
        const { keyId } = params;
        const { _id }: User = state.user;

        console.info(
            `Removing API Key with ID: ${keyId} for User with ID: ${_id}`,
        );
        await UserService.removeApiKey(_id, keyId);
        response.status = Status.NoContent;
    }
}

export default UserController;
