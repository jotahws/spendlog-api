import { Next, RouterContext } from "@oak/oak";

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

    // Optionally save session data back to the store
    sessionStore.set(sessionId, ctx.state.session);
}
