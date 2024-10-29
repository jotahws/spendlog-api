import { Router } from "@oak/oak/router";
import ExpenseController from "../controllers/expense.controller.ts";
import validate from "../middleware/validate.middleware.ts";
import {
    ExpenseQRCodeListSchema,
    ExpenseQRCodeSchema,
    ExpenseSchema,
} from "../models/expenses.model.ts";

const expenseRouter = new Router();

expenseRouter.post(
    "/expense",
    validate(ExpenseSchema),
    ExpenseController.create,
);
expenseRouter.post(
    "/expense/qr",
    validate(ExpenseQRCodeSchema),
    ExpenseController.createWithQrCode,
);
expenseRouter.post(
    "/expense/qr/bulk",
    validate(ExpenseQRCodeListSchema),
    ExpenseController.createManyWithQrCode,
);

export default expenseRouter;
