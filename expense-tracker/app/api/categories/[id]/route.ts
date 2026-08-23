import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/src/lib/prisma";
import { requireAuth } from "@/src/lib/require-auth";

const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(50, "Category name must be less than 50 characters"),
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

    // 2. Get category ID
    const { id } = await context.params;

    // 3. Check ownership
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    // 4. Read request body
    const body = await request.json();

    // 5. Validate input
    const result = updateCategorySchema.safeParse(body);

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

    const { name } = result.data;

    // 6. Check duplicate category name
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        userId,
        name,
        NOT: {
          id,
        },
      },
    });

    if (duplicateCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Category already exists",
        },
        { status: 409 }
      );
    }

    // 7. Update category
    const category = await prisma.category.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });

    // 8. Return updated category
    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete Category
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

    // 2. Get category ID
    const { id } = await context.params;

    // 3. Check category ownership
    const category = await prisma.category.findFirst({
      where: {
        id,
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

    // 4. Delete category
    // Because the Expense relation uses onDelete: Cascade,
    // all expenses belonging to this category will also be deleted.
    await prisma.category.delete({
      where: {
        id,
      },
    });

    // 5. Return success
    return NextResponse.json({
      success: true,
      message: "Category and related expenses deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}