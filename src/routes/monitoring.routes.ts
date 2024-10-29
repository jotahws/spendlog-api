import { Router } from "@oak/oak/router";
import MonitoringController from "../controllers/monitoring.controller.ts";

const monitoringRouter = new Router();

monitoringRouter.get(
    "/health",
    MonitoringController.healthCheck,
);
monitoringRouter.get(
    "/env",
    MonitoringController.getEnv,
);

export default monitoringRouter;
