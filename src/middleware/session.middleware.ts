import { Next, RouterContext, Status } from "@oak/oak";
import UserService from "../services/user.service.ts";
import { throwError } from "./errorHandler.middleware.ts";

const sessionStore = new Map<string, Record<string, unknown>>();

export async function sessionMiddleware(
    ctx: RouterContext<string>,
    next: Next,
) {
    const cookies = ctx.cookies;
    let sessionId = await cookies.get("SESSIONID");

    if (!sessionId || !sessionStore.has(sessionId)) {
        sessionId = crypto.randomUUID();
        sessionStore.set(sessionId, {});
        cookies.set("SESSIONID", sessionId, {
            httpOnly: true,
            secure: false,
        });
    }

    ctx.state.session = sessionStore.get(sessionId);
    ctx.state.sessionId = sessionId;

    await next();

    sessionStore.set(sessionId, ctx.state.session);
}

export async function validateApiKey(
    ctx: RouterContext<string>,
    next: Next,
) {
    const authorization = ctx.request.headers.get("Authorization") ||
        await ctx.cookies.get("Authorization");
    const key = authorization?.split(" ")[1];
    console.info(`Checking API Key ${key}`);
    if (!key) {
        throwError({
            status: Status.Forbidden,
            name: "No API Key",
            path: "session.middleware",
            message: "You must have an API Key to access.",
            type: "Forbidden",
        });
    }
    const user = await UserService.findByApiKey(key ?? "");
    if (user) {
        ctx.state.user = user;
    } else {
        throwError({
            status: Status.Unauthorized,
            name: "Invalid API Key",
            path: "session.middleware",
            message: "The api key is invalid.",
            type: "Unauthorized",
        });
    }

    await next();
}
