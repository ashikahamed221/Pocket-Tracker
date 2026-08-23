import { NextResponse } from "next/server";

import { prisma } from "@/src/lib/prisma";
import { requireAuth } from "@/src/lib/require-auth";

export async function GET(request: Request) {
  try {
    // 1. Authenticate user
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

    // 2. Get current date
    const now = new Date();

    // 3. Start and end of current month
    const startOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    );

    const startOfNextMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
    );

    // 4. Start and end of today
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

    // 5. Fetch current month's income
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

    // 6. Fetch current month's expenses
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

    // 7. Fetch today's income
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

    // 8. Fetch today's expenses
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

    // 9. Calculate totals
    const totalIncome = Number(monthlyIncome._sum.amount ?? 0);
    const totalExpenses = Number(monthlyExpenses._sum.amount ?? 0);

    const totalSavings = totalIncome - totalExpenses;

    const dailyIncome = Number(todayIncome._sum.amount ?? 0);
    const dailyExpenses = Number(todayExpenses._sum.amount ?? 0);

    const dailySavings = dailyIncome - dailyExpenses;

    // 10. Get expenses grouped by category
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

    // 11. Get category names
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

    // 12. Combine category names with totals
    const categoryMap = new Map(
      categories.map((category) => [
        category.id,
        category.name,
      ])
    );

    const categoryBreakdown = expensesByCategory.map((item) => ({
      categoryId: item.categoryId,
      categoryName:
        categoryMap.get(item.categoryId) ?? "Unknown",
      amount: Number(item._sum.amount ?? 0),
    }));

    // 13. Return dashboard data
    return NextResponse.json({
      success: true,

      period: {
        month: now.getUTCMonth() + 1,
        year: now.getUTCFullYear(),
      },

      summary: {
        income: totalIncome,
        expenses: totalExpenses,
        savings: totalSavings,
      },

      today: {
        income: dailyIncome,
        expenses: dailyExpenses,
        savings: dailySavings,
      },

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