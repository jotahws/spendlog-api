import type { ObjectId } from "@db/mongo";
import { Status, STATUS_TEXT } from "@oak/oak";
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
        name: "ExpenseService insert Conflict",
        path: "expense.service.insert",
        message: `Expense ${expense.atcud} already inserted`,
        type: STATUS_TEXT[Status.Conflict],
      });
    }
    const expenseId: string | ObjectId = await expensesCollection.insertOne(
      expense,
    );
    return { _id: expenseId, ...expense };
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
        name: "ExpenseService insertMany errors",
        path: "expense.service.insertMany",
        message: errors,
        type: STATUS_TEXT[Status.BadRequest],
      });
    }
    return { inserted: insertedExpenses, errors };
  }
}
