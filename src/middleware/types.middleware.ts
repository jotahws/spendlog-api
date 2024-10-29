import type { ZodError } from "zod";

export interface Err {
    status: number;
    name: string;
    message: string | ZodError | Array<string>;
    path: string;
    type?: string;
}

export interface ICustomError extends Error {
    status?: number;
    statusCode?: number;
    path?: string;
    type?: string;
}
