import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/src/lib/prisma";
import { requireAuth } from "@/src/lib/require-auth";

const updateIncomeSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .optional(),

  date: z.coerce.date().optional(),

  note: z
    .string()
    .trim()
    .max(500, "Note must be less than 500 characters")
    .optional(),
});

// PATCH - Update Income
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

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

    const body = await request.json();

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

    const { amount, date, note } = result.data;

    const income = await prisma.income.update({
      where: {
        id,
      },
      data: {
        ...(amount !== undefined ? { amount } : {}),
        ...(date !== undefined ? { date } : {}),
        ...(note !== undefined ? { note: note || null } : {}),
      },
    });

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

// DELETE - Delete Income
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

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

    await prisma.income.delete({
      where: {
        id,
      },
    });

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