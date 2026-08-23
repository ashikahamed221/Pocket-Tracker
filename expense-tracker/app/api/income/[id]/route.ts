import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/src/lib/prisma";
import { requireAuth } from "@/src/lib/require-auth";

const updateIncomeSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .optional(),

  type: z
    .enum(["DAILY", "MONTHLY"])
    .optional(),

  date: z
    .coerce
    .date()
    .optional(),

  note: z
    .string()
    .trim()
    .max(500, "Note must be less than 500 characters")
    .nullable()
    .optional(),
});

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
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

    // 2. Get income ID
    const { id } = await context.params;

    // 3. Check that income belongs to current user
    const existingIncome = await prisma.income.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingIncome) {
      return NextResponse.json(
        {
          success: false,
          message: "Income not found",
        },
        { status: 404 }
      );
    }

    // 4. Read request body
    const body = await request.json();

    // 5. Validate request
    const result = updateIncomeSchema.safeParse(body);

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

    // 6. Update income
    const income = await prisma.income.update({
      where: {
        id,
      },
      data: result.data,
    });

    // 7. Return updated income
    return NextResponse.json({
      success: true,
      message: "Income updated successfully",
      income,
    });
  } catch (error) {
    console.error("Update income error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}


// Delete Income

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
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

    // 2. Get income ID
    const { id } = await context.params;

    // 3. Check ownership
    const existingIncome = await prisma.income.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingIncome) {
      return NextResponse.json(
        {
          success: false,
          message: "Income not found",
        },
        { status: 404 }
      );
    }

    // 4. Delete income
    await prisma.income.delete({
      where: {
        id,
      },
    });

    // 5. Return success
    return NextResponse.json({
      success: true,
      message: "Income deleted successfully",
    });
  } catch (error) {
    console.error("Delete income error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}