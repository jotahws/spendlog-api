import { Router } from "@oak/oak";
import { Application } from "@oak/oak/application";
import config from "./src/config/config.ts";
import { errorHandler } from "./src/middleware/errorHandler.middleware.ts";
import expenseRouter from "./src/routes/expense.routes.ts";
import monitoringRouter from "./src/routes/monitoring.routes.ts";

const { port, env } = config;
console.log(`Environment: ${env}`);

const app = new Application();
const router = new Router();

app.use(errorHandler);
app.use(router.allowedMethods());
app.use(expenseRouter.routes());
app.use(monitoringRouter.routes());

await app.listen({ hostname: "0.0.0.0", port });
