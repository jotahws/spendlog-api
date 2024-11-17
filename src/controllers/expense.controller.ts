import { Status } from "@oak/oak";
import type { RouterContext } from "@oak/oak/router";
import {
    type Expense,
    type ExpenseFilter,
    ExpenseFilterSchema,
    type ExpenseQrCode,
    type ExpenseQrCodeList,
} from "../models/expenses.model.ts";
import ExpenseService from "../services/expense.service.ts";
import { formatQr } from "../utils/qrCode.ts";

class ExpenseController {
    public static async create({ request, response }: RouterContext<string>) {
        const body: Expense = await request.body.json();
        console.info("Creating Expense");
        response.body = await ExpenseService.insert(body);
        response.status = Status.Created;
    }

    public static async createWithQrCode(
        { request, response }: RouterContext<string>,
    ) {
        const body: ExpenseQrCode = await request.body.json();
        const expense = formatQr(body.qrCode);
        console.info("Creating Expense with QRCode");
        response.body = await ExpenseService.insert(expense);
        response.status = Status.Created;
    }

    public static async createManyWithQrCode(
        { request, response }: RouterContext<string>,
    ) {
        const body: ExpenseQrCodeList = await request.body.json();
        console.info("Creating bulk Expenses with QR Codes");
        const expenses = body.map((qr) => formatQr(qr));
        const insertedExpenses = await ExpenseService.insertMany(expenses);
        response.body = insertedExpenses;
        response.status = Status.Created;
    }

    public static async get({ params, response }: RouterContext<string>) {
        const { id } = params;
        console.info(`Fetching Expense with ID: ${id}`);
        const expense = await ExpenseService.findById(id);

        response.body = expense;
        response.status = Status.OK;
    }

    public static async getList({ request, response }: RouterContext<string>) {
        console.info("Fetching all Expenses");
        const queryParams = Object.fromEntries(
            request.url.searchParams,
        );
        const parsedFilter: ExpenseFilter = ExpenseFilterSchema.parse(
            queryParams,
        );
        const expenses = await ExpenseService.findAll(parsedFilter);
        response.body = expenses;
        response.status = Status.OK;
    }

    public static async deleteByAtcud(
        { params, response }: RouterContext<string>,
    ) {
        const { atcud } = params;
        console.info(`Deleting Expense with ATCUD: ${atcud}`);
        await ExpenseService.deleteByAtcud(atcud);
        response.status = Status.OK;
    }
}

export default ExpenseController;
