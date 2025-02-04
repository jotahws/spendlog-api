import { Status, STATUS_TEXT } from "@oak/oak";
import { type Filter, ObjectId } from "mongodb";
import db from "../config/db.ts";
import { throwError } from "../middleware/errorHandler.middleware.ts";
import type { Expense, ExpenseFilter } from "../models/expenses.model.ts";

export default class ExpenseService {
  public static async insert(
    expense: Expense,
    userId: string,
  ): Promise<Expense> {
    const expensesCollection = db.getDatabase.collection<Expense>("expenses");
    const expenseDup = await expensesCollection.findOne({
      atcud: expense.atcud,
      userId: new ObjectId(userId),
    });
    if (expenseDup !== null) {
      throwError({
        status: Status.Conflict,
        name: "Expense insert conflict",
        path: "expense.service.insert",
        message: `Expense ${expense.atcud} already inserted`,
        type: STATUS_TEXT[Status.Conflict],
      });
    }
    const { insertedId } = await expensesCollection.insertOne({
      ...expense,
      userId: new ObjectId(userId),
    }, {
      ignoreUndefined: true,
    });
    return { _id: insertedId, ...expense };
  }

  public static async insertMany(
    expenses: Expense[],
    userId: string,
  ): Promise<{ inserted: Expense[]; errors: string[] }> {
    const insertedExpenses: Expense[] = [];
    const errors: string[] = [];

    for (const expense of expenses) {
      try {
        const insertedExpense = await this.insert(
          expense,
          userId,
        );
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

  public static async findById(
    id: string,
    userId: string,
  ): Promise<Expense | null> {
    const expensesCollection = db.getDatabase.collection<Expense>("expenses");
    const objectId = new ObjectId(id);
    const expense = await expensesCollection.aggregate([
      {
        $match: {
          _id: objectId,
          userId: new ObjectId(userId),
        },
      },
      { $sort: { documentDate: -1 } },
      {
        $lookup: {
          from: "merchants",
          localField: "merchantVatNumber",
          foreignField: "nif",
          as: "merchantData",
          pipeline: [
            {
              $project: {
                _id: 1,
                nif: 1,
                title: 1,
                city: 1,
                activity: 1,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$merchantData", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          merchantName: "$merchantData.title",
          merchantCity: "$merchantData.city",
          merchantActivity: "$merchantData.activity",
        },
      },
      {
        $project: {
          merchantData: 0,
        },
      },
    ]).next();

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

  public static async findAll(
    filter: ExpenseFilter,
    userId: string,
  ): Promise<Expense[]> {
    const expensesCollection = db.getDatabase.collection<Expense>("expenses");

    const query: Filter<Expense> = {
      userId: new ObjectId(userId),
    };

    if (filter.dateFrom || filter.dateTo) {
      query.documentDate = {};
      if (filter.dateFrom !== undefined) {
        query.documentDate.$gte = filter.dateFrom;
      }
      if (filter.dateTo !== undefined) {
        query.documentDate.$lte = filter.dateTo;
      }
    }

    if (filter.minAmount || filter.maxAmount) {
      query.totalAmount = {};
      if (filter.minAmount !== undefined) {
        query.totalAmount.$gte = filter.minAmount;
      }
      if (filter.maxAmount !== undefined) {
        query.totalAmount.$lte = filter.maxAmount;
      }
    }

    if (filter.atcud) {
      query.atcud = filter.atcud;
    }

    if (filter.merchantVatNumber) {
      query.merchantVatNumber = filter.merchantVatNumber;
    }
    return await expensesCollection.aggregate([
      { $match: query },
      { $sort: { documentDate: -1 } },
      {
        $lookup: {
          from: "merchants",
          localField: "merchantVatNumber",
          foreignField: "nif",
          as: "merchantData",
          pipeline: [
            {
              $project: {
                _id: 1,
                nif: 1,
                title: 1,
                city: 1,
                activity: 1,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$merchantData", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          merchantName: "$merchantData.title",
          merchantCity: "$merchantData.city",
          merchantActivity: "$merchantData.activity",
        },
      },
      {
        $project: {
          merchantData: 0,
        },
      },
    ]).toArray();
  }

  public static async deleteByAtcud(
    atcud: string,
    userId: string,
  ): Promise<void> {
    const expensesCollection = db.getDatabase.collection<Expense>("expenses");
    const result = await expensesCollection.deleteOne({
      atcud,
      userId: new ObjectId(userId),
    });
    if (result.deletedCount === 0) {
      throwError({
        status: Status.NotFound,
        name: "Expense not found",
        path: "expense.service.deleteByAtcud",
        message: `Expense with ATCUD ${atcud} not found`,
        type: STATUS_TEXT[Status.NotFound],
      });
    }
  }
}
