import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/src/lib/prisma";
import { requireAuth } from "@/src/lib/require-auth";

const createExpenseSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),

  categoryId: z.string().min(1, "Category is required"),

  date: z.coerce.date(),

  note: z
    .string()
    .trim()
    .max(500, "Note must be less than 500 characters")
    .optional(),
});

// POST - Create Expense
export async function POST(request: Request) {
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

    // 2. Read request body
    const body = await request.json();

    // 3. Validate input
    const result = createExpenseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { amount, categoryId, date, note } = result.data;

    // 4. Check category ownership
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    // 5. Create expense
    const expense = await prisma.expense.create({
      data: {
        userId,
        categoryId,
        amount,
        date,
        note: note || null,
      },
      include: {
        category: true,
      },
    });

    // 6. Return created expense
    return NextResponse.json(
      {
        success: true,
        message: "Expense created successfully",
        expense,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create expense error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}

// GET - Get Expenses
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

    // 2. Read query parameters
    const { searchParams } = new URL(request.url);

    const categoryId = searchParams.get("categoryId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // 3. Check category ownership
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId,
        },
      });

      if (!category) {
        return NextResponse.json(
          {
            success: false,
            message: "Category not found",
          },
          { status: 404 }
        );
      }
    }

    // 4. Validate dates
    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    if (from) {
      const parsedFromDate = new Date(`${from}T00:00:00.000Z`);

      if (Number.isNaN(parsedFromDate.getTime())) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid 'from' date.",
          },
          { status: 400 }
        );
      }

      fromDate = parsedFromDate;
    }

    if (to) {
      const parsedToDate = new Date(`${to}T23:59:59.999Z`);

      if (Number.isNaN(parsedToDate.getTime())) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid 'to' date.",
          },
          { status: 400 }
        );
      }

      toDate = parsedToDate;
    }

    // 5. Validate date range
    if (fromDate && toDate && fromDate > toDate) {
      return NextResponse.json(
        {
          success: false,
          message: "'from' date cannot be after 'to' date.",
        },
        { status: 400 }
      );
    }

    // 6. Build filters
    const where = {
      userId,

      ...(categoryId
        ? {
            categoryId,
          }
        : {}),

      ...(fromDate || toDate
        ? {
            date: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: toDate } : {}),
            },
          }
        : {}),
    };

    // 7. Get expenses
    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    // 8. Return expenses
    return NextResponse.json({
      success: true,
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    console.error("Get expenses error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}