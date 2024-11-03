import { Status, STATUS_TEXT } from "@oak/oak";
import { ObjectId } from "mongodb";
import db from "../config/db.ts";
import { throwError } from "../middleware/errorHandler.middleware.ts";
import type { Expense } from "../models/expenses.model.ts";

export default class ExpenseService {
  public static async insert(expense: Expense): Promise<Expense> {
    const expensesCollection = db.getDatabase.collection<Expense>("expenses");
    const expenseDup = await expensesCollection.findOne(expense);
    if (expenseDup?.atcud) {
      throwError({
        status: Status.Conflict,
        name: "Expense insert conflict",
        path: "expense.service.insert",
        message: `Expense ${expense.atcud} already inserted`,
        type: STATUS_TEXT[Status.Conflict],
      });
    }
    const sanitizedExpense = JSON.parse(JSON.stringify(expense));
    const { insertedId } = await expensesCollection.insertOne(sanitizedExpense);
    return { _id: insertedId, ...expense };
  }

  public static async insertMany(
    expenses: Expense[],
  ): Promise<{ inserted: Expense[]; errors: string[] }> {
    const insertedExpenses: Expense[] = [];
    const errors: string[] = [];

    for (const expense of expenses) {
      try {
        const insertedExpense = await this.insert(expense);
        insertedExpenses.push(insertedExpense);
      } catch (error) {
        const e = error as Error;
        errors.push(e.message);
      }
    }
    if (!insertedExpenses.length) {
      throwError({
        status: Status.BadRequest,
        name: "Expense bulk insert errors",
        path: "expense.service.insertMany",
        message: errors,
        type: STATUS_TEXT[Status.BadRequest],
      });
    }
    return { inserted: insertedExpenses, errors };
  }

  public static async findById(id: string): Promise<Expense | null> {
    const expensesCollection = db.getDatabase.collection<Expense>("expenses");
    const objectId = new ObjectId(id);
    const expense = await expensesCollection.findOne({ _id: objectId });
    if (!expense) {
      throwError({
        status: Status.NotFound,
        name: "Expense not found",
        path: "expense.service.findById",
        message: `Expense ${id} not found`,
        type: STATUS_TEXT[Status.NotFound],
      });
    }
    return expense ?? null;
  }

  public static async findAll(): Promise<Expense[]> {
    const expensesCollection = db.getDatabase.collection<Expense>("expenses");
    return await expensesCollection.find().toArray();
  }
}
