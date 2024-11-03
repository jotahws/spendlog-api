import { Context, Next, type RouterContext, Status } from "@oak/oak";
import { ZodError, ZodSchema } from "zod";
import { throwError } from "./errorHandler.middleware.ts";

export const validateBody = (schema: ZodSchema) => {
    return async (ctx: Context, next: Next) => {
        try {
            const body = await ctx.request.body.json();
            schema.parse(body);
            await next();
        } catch (error) {
            if (error instanceof ZodError) {
                throwError({
                    status: Status.BadRequest,
                    name: "Request Body Validation Error",
                    path: "validate.middleware",
                    message: error,
                    type: "BadRequest",
                });
            }
            throw error;
        }
    };
};

export const validateQueryParams = (schema: ZodSchema) => {
    return async (ctx: RouterContext<string>, next: Next) => {
        try {
            const queryParams = Object.fromEntries(
                ctx.request.url.searchParams,
            );
            schema.parse(queryParams);
            await next();
        } catch (error) {
            if (error instanceof ZodError) {
                throwError({
                    status: Status.BadRequest,
                    name: "Query Params Validation Error",
                    path: "validate.middleware",
                    message: error,
                    type: "BadRequest",
                });
            }
            throw error;
        }
    };
};

export const validateRouteParams = (schema: ZodSchema) => {
    return async (ctx: RouterContext<string>, next: Next) => {
        try {
            const params = ctx.params;
            schema.parse(params);
            await next();
        } catch (error) {
            if (error instanceof ZodError) {
                throwError({
                    status: Status.BadRequest,
                    name: "Route Params Validation Error",
                    path: "validate.middleware",
                    message: error,
                    type: "BadRequest",
                });
            }
            throw error;
        }
    };
};
