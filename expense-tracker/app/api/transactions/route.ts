import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/src/lib/prisma";
import { requireAuth } from "@/src/lib/require-auth";

const transactionQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format")
    .optional(),

  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .optional(),
});

export async function GET(request: Request) {
  try {
    // 1. Authentication
    const userId = await requireAuth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // 2. Read query parameters
    const { searchParams } = new URL(request.url);

    const result = transactionQuerySchema.safeParse({
      month: searchParams.get("month") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid query parameters",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 3. Determine selected month
    const now = new Date();

    let selectedYear = now.getUTCFullYear();
    let selectedMonth = now.getUTCMonth();

    if (result.data.month) {
      const [year, month] = result.data.month.split("-");

      selectedYear = Number(year);
      selectedMonth = Number(month) - 1;
    }

    // 4. Create month date range
    const startOfMonth = new Date(
      Date.UTC(selectedYear, selectedMonth, 1)
    );

    const startOfNextMonth = new Date(
      Date.UTC(selectedYear, selectedMonth + 1, 1)
    );

    // 5. Fetch income and expenses
    const [incomes, expenses] = await Promise.all([
      prisma.income.findMany({
        where: {
          userId,
          date: {
            gte: startOfMonth,
            lt: startOfNextMonth,
          },
        },
        select: {
          id: true,
          amount: true,
          date: true,
          note: true,
        },
      }),

      prisma.expense.findMany({
        where: {
          userId,
          date: {
            gte: startOfMonth,
            lt: startOfNextMonth,
          },
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    // 6. Convert both into one transaction format
    const incomeTransactions = incomes.map((income) => ({
      id: income.id,
      type: "INCOME" as const,
      amount: Number(income.amount),
      date: income.date,
      note: income.note,
      category: null,
    }));

    const expenseTransactions = expenses.map((expense) => ({
      id: expense.id,
      type: "EXPENSE" as const,
      amount: Number(expense.amount),
      date: expense.date,
      note: expense.note,
      category: expense.category,
    }));

    // 7. Combine transactions
    const transactions = [
      ...incomeTransactions,
      ...expenseTransactions,
    ];

    // 8. Sort newest first
    transactions.sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    // 9. Apply limit
    const limitedTransactions = result.data.limit
      ? transactions.slice(0, result.data.limit)
      : transactions;

    // 10. Response
    return NextResponse.json({
      success: true,

      period: {
        month: selectedMonth + 1,
        year: selectedYear,
      },

      count: limitedTransactions.length,

      transactions: limitedTransactions.map((transaction) => ({
        ...transaction,
        date: transaction.date.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Get transactions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}