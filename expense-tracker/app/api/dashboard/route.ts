import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/src/lib/prisma";
import { requireAuth } from "@/src/lib/require-auth";

const dashboardQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format")
    .optional(),
});

export async function GET(request: Request) {
  try {
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
    // 1. Read month query parameter
    // --------------------------------

    const { searchParams } = new URL(request.url);

    const result = dashboardQuerySchema.safeParse({
      month: searchParams.get("month") ?? undefined,
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
    // 2. Determine selected month
    // --------------------------------

    const now = new Date();

    let selectedYear = now.getUTCFullYear();
    let selectedMonth = now.getUTCMonth();

    if (result.data.month) {
      const [year, month] = result.data.month.split("-");

      selectedYear = Number(year);
      selectedMonth = Number(month) - 1;
    }

    // --------------------------------
    // 3. Selected month date range
    // --------------------------------

    const startOfMonth = new Date(
      Date.UTC(selectedYear, selectedMonth, 1)
    );

    const startOfNextMonth = new Date(
      Date.UTC(selectedYear, selectedMonth + 1, 1)
    );

    // --------------------------------
    // 4. Check if selected month
    //    is the current month
    // --------------------------------

    const isCurrentMonth =
      selectedYear === now.getUTCFullYear() &&
      selectedMonth === now.getUTCMonth();

    // --------------------------------
    // 5. Monthly Income
    // --------------------------------

    const monthlyIncome = await prisma.income.aggregate({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // --------------------------------
    // 6. Monthly Expenses
    // --------------------------------

    const monthlyExpenses = await prisma.expense.aggregate({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // --------------------------------
    // 7. Monthly Savings
    // --------------------------------

    const totalIncome = Number(monthlyIncome._sum.amount ?? 0);

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
    // 9. Expenses by Category
    // --------------------------------

    const expensesByCategory = await prisma.expense.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lt: startOfNextMonth,
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

    // --------------------------------
    // 10. Get category names
    // --------------------------------

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

    // --------------------------------
    // 11. Build category breakdown
    // --------------------------------

    const categoryBreakdown = expensesByCategory.map((item) => ({
      categoryId: item.categoryId,
      categoryName:
        categoryMap.get(item.categoryId) ?? "Unknown",
      amount: Number(item._sum.amount ?? 0),
    }));

    // --------------------------------
    // 12. Response
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