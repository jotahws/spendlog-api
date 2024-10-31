import { Status } from "@oak/oak";
import type { RouterContext } from "@oak/oak/router";

class MonitoringController {
    public static healthCheck({ response }: RouterContext<string>) {
        response.status = Status.NoContent;
    }
    public static getEnv({ response }: RouterContext<string>) {
        response.body = {
            env: Deno.env.get("ENV"),
        };
        response.status = Status.OK;
    }
}

export default MonitoringController;
