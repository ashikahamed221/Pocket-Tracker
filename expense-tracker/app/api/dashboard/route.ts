import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/src/lib/prisma";
import { requireAuth } from "@/src/lib/require-auth";

const dashboardQuerySchema = z
  .object({
    month: z
      .string()
      .regex(
        /^\d{4}-(0[1-9]|1[0-2])$/,
        "Month must be in YYYY-MM format"
      )
      .optional(),

    from: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "From date must be in YYYY-MM-DD format"
      )
      .optional(),

    to: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "To date must be in YYYY-MM-DD format"
      )
      .optional(),
  })
  .refine(
    (data) => {
      if (data.from && data.to) {
        return data.from <= data.to;
      }

      return true;
    },
    {
      message: "From date cannot be after To date",
      path: ["from"],
    }
  );

export async function GET(request: Request) {
  try {
    // --------------------------------
    // 1. Authentication
    // --------------------------------

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

    // --------------------------------
    // 2. Read month query parameter
    // --------------------------------

    const { searchParams } = new URL(request.url);

    const result = dashboardQuerySchema.safeParse({
      month: searchParams.get("month") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid month",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // 3. Determine selected month
    // --------------------------------

    // --------------------------------
    // 3. Determine selected date range
    // --------------------------------

    const now = new Date();

    let selectedYear = now.getUTCFullYear();
    let selectedMonth = now.getUTCMonth();

    let startDate: Date;
    let endDate: Date;

    if (result.data.from && result.data.to) {
      // Custom date range

      const [fromYear, fromMonth, fromDay] =
        result.data.from.split("-").map(Number);

      const [toYear, toMonth, toDay] =
        result.data.to.split("-").map(Number);

      startDate = new Date(
        Date.UTC(fromYear, fromMonth - 1, fromDay)
      );

      // Exclusive end date = selected To date + 1 day
      endDate = new Date(
        Date.UTC(toYear, toMonth - 1, toDay + 1)
      );

      selectedYear = fromYear;
      selectedMonth = fromMonth - 1;
    } else {
      // Monthly range

      if (result.data.month) {
        const [year, month] =
          result.data.month.split("-");

        selectedYear = Number(year);
        selectedMonth = Number(month) - 1;
      }

      startDate = new Date(
        Date.UTC(selectedYear, selectedMonth, 1)
      );

      endDate = new Date(
        Date.UTC(selectedYear, selectedMonth + 1, 1)
      );
    }



    // --------------------------------
    // 5. Check current month
    // --------------------------------

    const isCurrentMonth =
      !result.data.from &&
      selectedYear === now.getUTCFullYear() &&
      selectedMonth === now.getUTCMonth();

    // --------------------------------
    // 6. Monthly Income
    // --------------------------------

    const monthlyIncome = await prisma.income.aggregate({
      where: {
        userId,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // --------------------------------
    // 7. Monthly Expenses
    // --------------------------------

    const monthlyExpenses = await prisma.expense.aggregate({
      where: {
        userId,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalIncome = Number(
      monthlyIncome._sum.amount ?? 0
    );

    const totalExpenses = Number(
      monthlyExpenses._sum.amount ?? 0
    );

    const totalSavings = totalIncome - totalExpenses;

    // --------------------------------
    // 8. Today's data
    // --------------------------------

    let today = null;

    if (isCurrentMonth) {
      const startOfToday = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate()
        )
      );

      const startOfTomorrow = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + 1
        )
      );

      const todayIncome = await prisma.income.aggregate({
        where: {
          userId,
          date: {
            gte: startOfToday,
            lt: startOfTomorrow,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const todayExpenses = await prisma.expense.aggregate({
        where: {
          userId,
          date: {
            gte: startOfToday,
            lt: startOfTomorrow,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const dailyIncome = Number(
        todayIncome._sum.amount ?? 0
      );

      const dailyExpenses = Number(
        todayExpenses._sum.amount ?? 0
      );

      const dailySavings = dailyIncome - dailyExpenses;

      today = {
        income: dailyIncome,
        expenses: dailyExpenses,
        savings: dailySavings,
      };
    }

    // --------------------------------
    // 9. Get all income for selected month
    // --------------------------------

    const incomes = await prisma.income.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        amount: true,
        date: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // --------------------------------
    // 10. Get all expenses for selected month
    // --------------------------------

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        amount: true,
        date: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // --------------------------------
    // 11. Create daily income/expense maps
    // --------------------------------

    const dailyIncomeMap = new Map<string, number>();
    const dailyExpenseMap = new Map<string, number>();

    for (const income of incomes) {
      const dateKey = income.date.toISOString().slice(0, 10);

      const currentAmount =
        dailyIncomeMap.get(dateKey) ?? 0;

      dailyIncomeMap.set(
        dateKey,
        currentAmount + Number(income.amount)
      );
    }

    for (const expense of expenses) {
      const dateKey = expense.date.toISOString().slice(0, 10);

      const currentAmount =
        dailyExpenseMap.get(dateKey) ?? 0;

      dailyExpenseMap.set(
        dateKey,
        currentAmount + Number(expense.amount)
      );
    }

    // --------------------------------
    // 12. Build daily running balance
    // --------------------------------

    const dailySummary = [];

    let runningBalance = 0;

    const dailyStart = new Date(startDate);

    while (dailyStart < endDate) {
      const dateKey = dailyStart
        .toISOString()
        .slice(0, 10);

      const dailyIncome =
        dailyIncomeMap.get(dateKey) ?? 0;

      const dailyExpenses =
        dailyExpenseMap.get(dateKey) ?? 0;

      runningBalance =
        runningBalance +
        dailyIncome -
        dailyExpenses;

      dailySummary.push({
        date: dateKey,
        income: dailyIncome,
        expenses: dailyExpenses,
        savings: runningBalance,
      });

      dailyStart.setUTCDate(
        dailyStart.getUTCDate() + 1
      );
    }

    // --------------------------------
    // 13. Last 7 Days Spending
    // --------------------------------

    const last7StartDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - 6
      )
    );

    const last7EndDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1
      )
    );

    const last7Expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: last7StartDate,
          lt: last7EndDate,
        },
      },
      select: {
        amount: true,
        date: true,
      },
    });

    const last7ExpenseMap = new Map<string, number>();

    for (const expense of last7Expenses) {
      const dateKey = expense.date
        .toISOString()
        .slice(0, 10);

      const currentAmount =
        last7ExpenseMap.get(dateKey) ?? 0;

      last7ExpenseMap.set(
        dateKey,
        currentAmount + Number(expense.amount)
      );
    }

    const last7Days = [];

    const last7DayStart = new Date(last7StartDate);

    while (last7DayStart < last7EndDate) {
      const dateKey = last7DayStart
        .toISOString()
        .slice(0, 10);

      last7Days.push({
        date: dateKey,
        expenses: last7ExpenseMap.get(dateKey) ?? 0,
      });

      last7DayStart.setUTCDate(
        last7DayStart.getUTCDate() + 1
      );
    }

    // --------------------------------
    // 13. Expenses by Category
    // --------------------------------

    const expensesByCategory =
      await prisma.expense.groupBy({
        by: ["categoryId"],
        where: {
          userId,
          date: {
            gte: startDate,
            lt: endDate,
          },
        },
        _sum: {
          amount: true,
        },
        orderBy: {
          _sum: {
            amount: "desc",
          },
        },
      });

    const categoryIds = expensesByCategory.map(
      (item) => item.categoryId
    );

    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
        userId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    const categoryMap = new Map(
      categories.map((category) => [
        category.id,
        category.name,
      ])
    );

    const categoryBreakdown =
      expensesByCategory.map((item) => ({
        categoryId: item.categoryId,
        categoryName:
          categoryMap.get(item.categoryId) ?? "Unknown",
        amount: Number(item._sum.amount ?? 0),
      }));

    // --------------------------------
    // 14. Final response
    // --------------------------------

    return NextResponse.json({
      success: true,

      period: {
        month: selectedMonth + 1,
        year: selectedYear,
      },

      summary: {
        income: totalIncome,
        expenses: totalExpenses,
        savings: totalSavings,
      },

      today,

      dailySummary,

      last7Days,

      expensesByCategory: categoryBreakdown,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}