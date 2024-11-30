import { Router } from "@oak/oak/router";
import ExpenseController from "../controllers/expense.controller.ts";
import { validateApiKey } from "../middleware/session.middleware.ts";
import {
    validateBody,
    validateQueryParams,
    validateRouteParams,
} from "../middleware/validate.middleware.ts";
import {
    AtcudSchema,
    ExpenseFilterSchema,
    ExpenseQRCodeListSchema,
    ExpenseQRCodeSchema,
    ExpenseSchema,
    IdSchema,
} from "../models/expenses.model.ts";

const expenseRouter = new Router();

expenseRouter.post(
    "/expense",
    validateApiKey,
    validateBody(ExpenseSchema),
    ExpenseController.create,
);
expenseRouter.post(
    "/expense/qr",
    validateApiKey,
    validateBody(ExpenseQRCodeSchema),
    ExpenseController.createWithQrCode,
);
expenseRouter.post(
    "/expense/qr/bulk",
    validateApiKey,
    validateBody(ExpenseQRCodeListSchema),
    ExpenseController.createManyWithQrCode,
);
expenseRouter.get(
    "/expense/:id",
    validateApiKey,
    validateRouteParams(IdSchema),
    ExpenseController.get,
);
expenseRouter.get(
    "/expenses",
    validateApiKey,
    validateQueryParams(ExpenseFilterSchema),
    ExpenseController.getList,
);
expenseRouter.delete(
    "/expense/:atcud",
    validateApiKey,
    validateRouteParams(AtcudSchema),
    ExpenseController.deleteByAtcud,
);

export default expenseRouter;
