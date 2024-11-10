import { Router } from "@oak/oak/router";
import ExpenseController from "../controllers/expense.controller.ts";
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
    validateBody(ExpenseSchema),
    ExpenseController.create,
);
expenseRouter.post(
    "/expense/qr",
    validateBody(ExpenseQRCodeSchema),
    ExpenseController.createWithQrCode,
);
expenseRouter.post(
    "/expense/qr/bulk",
    validateBody(ExpenseQRCodeListSchema),
    ExpenseController.createManyWithQrCode,
);
expenseRouter.get(
    "/expense/:id",
    validateRouteParams(IdSchema),
    ExpenseController.get,
);
expenseRouter.get(
    "/expenses",
    validateQueryParams(ExpenseFilterSchema),
    ExpenseController.getList,
);
expenseRouter.delete(
    "/expense/:atcud",
    validateRouteParams(AtcudSchema),
    ExpenseController.deleteByAtcud,
);

export default expenseRouter;
