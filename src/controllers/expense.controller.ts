import { Status } from "@oak/oak";
import type { RouterContext } from "@oak/oak/router";
import {
    type Expense,
    type ExpenseFilter,
    ExpenseFilterSchema,
    type ExpenseQrCode,
    type ExpenseQrCodeList,
} from "../models/expenses.model.ts";
import { User } from "../models/user.model.ts";
import ExpenseService from "../services/expense.service.ts";
import { formatQr } from "../utils/qrCode.ts";

class ExpenseController {
    public static async create(
        { request, response, state }: RouterContext<string>,
    ) {
        const user: User = state.user;
        const body: Expense = await request.body.json();
        console.info("Creating Expense");
        response.body = await ExpenseService.insert(body, user._id);
        response.status = Status.Created;
    }

    public static async createWithQrCode(
        { request, response, state }: RouterContext<string>,
    ) {
        const user: User = state.user;
        const body: ExpenseQrCode = await request.body.json();
        const expense = formatQr(body.qrCode);
        console.info("Creating Expense with QRCode");
        response.body = await ExpenseService.insert(expense, user._id);
        response.status = Status.Created;
    }

    public static async createManyWithQrCode(
        { request, response, state }: RouterContext<string>,
    ) {
        const user: User = state.user;
        const body: ExpenseQrCodeList = await request.body.json();
        console.info("Creating bulk Expenses with QR Codes");
        const expenses = body.map((qr) => formatQr(qr));
        const insertedExpenses = await ExpenseService.insertMany(
            expenses,
            user._id,
        );
        response.body = insertedExpenses;
        response.status = Status.Created;
    }

    public static async get(
        { params, response, state }: RouterContext<string>,
    ) {
        const { id } = params;
        const user: User = state.user;
        console.info(`Fetching Expense with ID: ${id}`);
        const expense = await ExpenseService.findById(id, user._id);

        response.body = expense;
        response.status = Status.OK;
    }

    public static async getList(
        { request, response, state }: RouterContext<string>,
    ) {
        console.info("Fetching all Expenses");
        const user: User = state.user;
        const queryParams = Object.fromEntries(
            request.url.searchParams,
        );
        const parsedFilter: ExpenseFilter = ExpenseFilterSchema.parse(
            queryParams,
        );
        const expenses = await ExpenseService.findAll(parsedFilter, user._id);
        response.body = expenses;
        response.status = Status.OK;
    }

    public static async deleteByAtcud(
        { params, response, state }: RouterContext<string>,
    ) {
        const user: User = state.user;
        const { atcud } = params;
        console.info(`Deleting Expense with ATCUD: ${atcud}`);
        await ExpenseService.deleteByAtcud(atcud, user._id);
        response.status = Status.OK;
    }
}

export default ExpenseController;
