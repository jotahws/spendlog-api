import { Context, Next, Status } from "@oak/oak";
import { ZodError, ZodSchema } from "zod";
import { throwError } from "./errorHandler.middleware.ts";

const validate = (schema: ZodSchema) => {
    return async (ctx: Context, next: Next) => {
        try {
            const body = await ctx.request.body.json();
            schema.parse(body);
            await next();
        } catch (error) {
            if (error instanceof ZodError) {
                throwError({
                    status: Status.BadRequest,
                    name: "ValidationError",
                    path: "validate.middleware",
                    message: error,
                    type: "BadRequest",
                });
            }
            throw error;
        }
    };
};

export default validate;
