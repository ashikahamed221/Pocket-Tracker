import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/src/lib/prisma";
import { requireAuth } from "@/src/lib/require-auth";

const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(50, "Category name must be less than 50 characters"),
});

// POST - Create Category
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
    const result = createCategorySchema.safeParse(body);

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

    // 4. Check if category already exists for this user
    const existingCategory = await prisma.category.findUnique({
      where: {
        userId_name: {
          userId,
          name,
        },
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Category already exists",
        },
        { status: 409 }
      );
    }

    // 5. Create category
    const category = await prisma.category.create({
      data: {
        userId,
        name,
      },
    });

    // 6. Return created category
    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}


// GET - Get user's categories
export async function GET() {
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

    // 2. Get user's categories
    const categories = await prisma.category.findMany({
      where: {
        userId,
      },
      orderBy: {
        name: "asc",
      },
    });

    // 3. Return categories
    return NextResponse.json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}