import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/src/lib/prisma";
import { requireAuth } from "@/src/lib/require-auth";

const createIncomeSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than 0"),

  type: z.enum(["DAILY", "MONTHLY"]),

  date: z.coerce.date(),

  note: z
    .string()
    .trim()
    .max(500, "Note must be less than 500 characters")
    .optional(),
});

// POST - Create Income
export async function POST(request: Request) {
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

    const body = await request.json();

    const result = createIncomeSchema.safeParse(body);

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

    const { amount, type, date, note } = result.data;

    const income = await prisma.income.create({
      data: {
        userId,
        amount,
        type,
        date,
        note: note || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Income created successfully",
        income,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create income error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}

// GET - Get Income
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

    // Read query parameters
    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // Validate income type
    if (type && type !== "DAILY" && type !== "MONTHLY") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid income type. Use DAILY or MONTHLY.",
        },
        { status: 400 }
      );
    }

    // Validate dates
    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    if (from) {
      fromDate = new Date(`${from}T00:00:00.000Z`);

      if (Number.isNaN(fromDate.getTime())) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid 'from' date.",
          },
          { status: 400 }
        );
      }
    }

    if (to) {
      toDate = new Date(`${to}T23:59:59.999Z`);

      if (Number.isNaN(toDate.getTime())) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid 'to' date.",
          },
          { status: 400 }
        );
      }
    }

    // Validate date range
    if (fromDate && toDate && fromDate > toDate) {
      return NextResponse.json(
        {
          success: false,
          message: "'from' date cannot be after 'to' date.",
        },
        { status: 400 }
      );
    }

    // Build Prisma where condition
    const where = {
      userId,

      ...(type
        ? {
            type: type as "DAILY" | "MONTHLY",
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

    // Get income
    const incomes = await prisma.income.findMany({
      where,
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      count: incomes.length,
      incomes,
    });
  } catch (error) {
    console.error("Get income error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}