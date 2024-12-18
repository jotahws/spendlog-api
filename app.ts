import { Router } from "@oak/oak";
import { Application } from "@oak/oak/application";
import config from "./src/config/config.ts";
import { errorHandler } from "./src/middleware/errorHandler.middleware.ts";
import authRouter from "./src/routes/auth.routes.ts";
import expenseRouter from "./src/routes/expense.routes.ts";
import monitoringRouter from "./src/routes/monitoring.routes.ts";
import userRouter from "./src/routes/user.routes.ts";

const { port, env } = config;
console.log(`Environment: ${env}`);

const app = new Application();
const router = new Router();

app.use(errorHandler);
app.use(router.allowedMethods());
app.use(authRouter.routes());
app.use(userRouter.routes());
app.use(expenseRouter.routes());
app.use(monitoringRouter.routes());

await app.listen({ hostname: "0.0.0.0", port });
