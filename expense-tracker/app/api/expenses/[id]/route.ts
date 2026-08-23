import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/src/lib/prisma";
import { requireAuth } from "@/src/lib/require-auth";

const updateExpenseSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .optional(),

  categoryId: z
    .string()
    .min(1, "Category is required")
    .optional(),

  date: z.coerce.date().optional(),

  note: z
    .string()
    .trim()
    .max(500, "Note must be less than 500 characters")
    .nullable()
    .optional(),
});

// PATCH - Update Expense
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

    // 2. Get expense ID
    const { id } = await context.params;

    // 3. Check expense ownership
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingExpense) {
      return NextResponse.json(
        {
          success: false,
          message: "Expense not found",
        },
        { status: 404 }
      );
    }

    // 4. Read request body
    const body = await request.json();

    // 5. Validate input
    const result = updateExpenseSchema.safeParse(body);

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

    // 6. Check new category ownership
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

    // 7. Build update data
    const updateData = {
      ...(amount !== undefined ? { amount } : {}),
      ...(categoryId !== undefined ? { categoryId } : {}),
      ...(date !== undefined ? { date } : {}),
      ...(note !== undefined ? { note } : {}),
    };

    // 8. Update expense
    const expense = await prisma.expense.update({
      where: {
        id,
      },
      data: updateData,
      include: {
        category: true,
      },
    });

    // 9. Return updated expense
    return NextResponse.json({
      success: true,
      message: "Expense updated successfully",
      expense,
    });
  } catch (error) {
    console.error("Update expense error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete Expense
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

    // 2. Get expense ID
    const { id } = await context.params;

    // 3. Check expense ownership
    const expense = await prisma.expense.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!expense) {
      return NextResponse.json(
        {
          success: false,
          message: "Expense not found",
        },
        { status: 404 }
      );
    }

    // 4. Delete expense
    await prisma.expense.delete({
      where: {
        id,
      },
    });

    // 5. Return success
    return NextResponse.json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Delete expense error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}