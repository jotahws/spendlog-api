/**
 * Configuration file
 */
const config: {
    env: string;
    appName: string;
    mongoUri: string;
    dbName: string;
    port: number;
} = {
    env: Deno.env.get("ENV") as string,
    appName: Deno.env.get("APP_NAME") as string,
    mongoUri: Deno.env.get("MONGO_URI") as string,
    dbName: Deno.env.get("DB_NAME") as string,
    port: Deno.env.get("PORT") as unknown as number,
};

export default config;
