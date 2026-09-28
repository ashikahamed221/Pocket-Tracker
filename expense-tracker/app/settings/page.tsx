"use client";

import {
    FolderOpen,
    LogOut,
    User,
} from "lucide-react";

import DashboardLayout from "@/src/components/dashboard/DashboardLayout";

import { useEffect, useState } from "react";

import { signOut } from "next-auth/react";



export default function SettingsPage() {

    const [profile, setProfile] = useState<{
        name: string | null;
        email: string | null;
    } | null>(null);

    const [profileLoading, setProfileLoading] = useState(true);

    const [categories, setCategories] = useState<
        {
            id: string;
            name: string;
        }[]
    >([]);

    const [categoriesLoading, setCategoriesLoading] =
        useState(true);

    const [categoriesError, setCategoriesError] =
        useState("");

    const [newCategoryName, setNewCategoryName] = useState("");
    const [addingCategory, setAddingCategory] = useState(false);

    const [editingCategoryId, setEditingCategoryId] =
        useState<string | null>(null);

    const [editingCategoryName, setEditingCategoryName] =
        useState("");

    const [updatingCategory, setUpdatingCategory] =
        useState(false);

    const [deletingCategoryId, setDeletingCategoryId] =
    useState<string | null>(null);

    useEffect(() => {
        async function fetchProfile() {
            try {
                setProfileLoading(true);

                const response = await fetch("/api/auth/me");

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "Failed to load profile"
                    );
                }

                setProfile({
                    name: result.user?.name ?? null,
                    email: result.user?.email ?? null,
                });
            } catch (error) {
                console.error("Fetch profile error:", error);
            } finally {
                setProfileLoading(false);
            }
        }

        fetchProfile();
    }, []);


    useEffect(() => {
        async function fetchCategories() {
            try {
                setCategoriesLoading(true);
                setCategoriesError("");

                const response = await fetch("/api/categories");

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message ||
                        "Failed to load categories"
                    );
                }

                setCategories(result.categories ?? []);
            } catch (error) {
                console.error(
                    "Fetch categories error:",
                    error
                );

                setCategoriesError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load categories"
                );
            } finally {
                setCategoriesLoading(false);
            }
        }

        fetchCategories();
    }, []);

    async function handleAddCategory() {
        const name = newCategoryName.trim();

        if (!name) {
            setCategoriesError(
                "Category name is required."
            );
            return;
        }

        try {
            setAddingCategory(true);
            setCategoriesError("");

            const response = await fetch("/api/categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Failed to create category"
                );
            }

            setCategories((currentCategories) => [
                ...currentCategories,
                result.category,
            ]);

            setNewCategoryName("");
        } catch (error) {
            console.error(
                "Add category error:",
                error
            );

            setCategoriesError(
                error instanceof Error
                    ? error.message
                    : "Failed to create category"
            );
        } finally {
            setAddingCategory(false);
        }
    }

    async function handleUpdateCategory(categoryId: string) {
        const name = editingCategoryName.trim();

        if (!name) {
            setCategoriesError(
                "Category name is required."
            );
            return;
        }

        try {
            setUpdatingCategory(true);
            setCategoriesError("");

            const response = await fetch(
                `/api/categories/${categoryId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Failed to update category"
                );
            }

            setCategories((currentCategories) =>
                currentCategories.map((category) =>
                    category.id === categoryId
                        ? result.category
                        : category
                )
            );

            setEditingCategoryId(null);
            setEditingCategoryName("");
        } catch (error) {
            console.error(
                "Update category error:",
                error
            );

            setCategoriesError(
                error instanceof Error
                    ? error.message
                    : "Failed to update category"
            );
        } finally {
            setUpdatingCategory(false);
        }
    }

    async function handleDeleteCategory(categoryId: string) {
    const category = categories.find(
        (item) => item.id === categoryId
    );

    if (!category) {
        return;
    }

    const confirmed = window.confirm(
        `Delete "${category.name}"?\n\nAny expenses using this category will also be deleted.`
    );

    if (!confirmed) {
        return;
    }

    try {
        setDeletingCategoryId(categoryId);
        setCategoriesError("");

        const response = await fetch(
            `/api/categories/${categoryId}`,
            {
                method: "DELETE",
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Failed to delete category"
            );
        }

        setCategories((currentCategories) =>
            currentCategories.filter(
                (item) => item.id !== categoryId
            )
        );
    } catch (error) {
        console.error(
            "Delete category error:",
            error
        );

        setCategoriesError(
            error instanceof Error
                ? error.message
                : "Failed to delete category"
        );
    } finally {
        setDeletingCategoryId(null);
    }
}
    return (
        <DashboardLayout>
            <div className="min-h-screen bg-[#F8F7F2] px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-black">
                            Settings
                        </h1>

                        <p className="mt-1 text-sm text-[#6F6B63]">
                            Manage your account and expense categories.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Profile */}
                        <section className="rounded-2xl border border-[#E3DFD5] bg-white p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0E2]">
                                    <User className="h-5 w-5 text-[#FF8315]" />
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold text-black">
                                        Profile
                                    </h2>

                                    <p className="text-sm text-[#6F6B63]">
                                        Your account information
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#8A857B]">
                                        Name
                                    </p>

                                    <p className="text-sm font-medium text-black">
                                        {profileLoading
                                            ? "Loading..."
                                            : profile?.name || "Not available"}
                                    </p>
                                </div>

                                <div>
                                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#8A857B]">
                                        Email
                                    </p>

                                    <p className="text-sm font-medium text-black">
                                        {profileLoading
                                            ? "Loading..."
                                            : profile?.email || "Not available"}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Expense Categories */}
                        <section className="rounded-2xl border border-[#E3DFD5] bg-white p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0E2]">
                                    <FolderOpen className="h-5 w-5 text-[#FF8315]" />
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold text-black">
                                        Expense Categories
                                    </h2>

                                    <div className="space-y-3">
                                        {categoriesLoading && (
                                            <p className="text-sm text-[#6F6B63]">
                                                Loading categories...
                                            </p>
                                        )}
                                        <div className="flex flex-col gap-3 sm:flex-row">
                                            <input
                                                type="text"
                                                value={newCategoryName}
                                                onChange={(event) =>
                                                    setNewCategoryName(event.target.value)
                                                }
                                                placeholder="Enter category name"
                                                className="flex-1 rounded-xl border border-[#D8D4C9] bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#FF8315] focus:ring-2 focus:ring-[#FF8315]/10"
                                            />

                                            <button
                                                type="button"
                                                onClick={handleAddCategory}
                                                disabled={addingCategory}
                                                className="rounded-xl bg-[#FF8315] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#e66f08] disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {addingCategory
                                                    ? "Adding..."
                                                    : "Add Category"}
                                            </button>
                                        </div>

                                        {categoriesError && (
                                            <p className="text-sm text-red-500">
                                                {categoriesError}
                                            </p>
                                        )}

                                        {!categoriesLoading &&
                                            !categoriesError &&
                                            categories.length === 0 && (
                                                <div className="rounded-xl border border-dashed border-[#D8D4C9] p-6 text-center">
                                                    <p className="text-sm text-[#6F6B63]">
                                                        No expense categories found.
                                                    </p>
                                                </div>
                                            )}

                                        {!categoriesLoading &&
                                            categories.map((category) => (
                                                <div
                                                    key={category.id}
                                                    className="flex items-center justify-between gap-3 rounded-xl border border-[#E3DFD5] px-4 py-3"
                                                >
                                                    {editingCategoryId === category.id ? (
                                                        <input
                                                            type="text"
                                                            value={editingCategoryName}
                                                            onChange={(event) =>
                                                                setEditingCategoryName(event.target.value)
                                                            }
                                                            className="min-w-0 flex-1 rounded-lg border border-[#D8D4C9] px-3 py-2 text-sm text-black outline-none focus:border-[#FF8315]"
                                                        />
                                                    ) : (
                                                        <p className="min-w-0 flex-1 text-sm font-medium text-black">
                                                            {category.name}
                                                        </p>
                                                    )}

                                                    <div className="flex shrink-0 gap-2">
                                                        {editingCategoryId === category.id ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleUpdateCategory(category.id)
                                                                    }
                                                                    disabled={updatingCategory}
                                                                    className="rounded-lg bg-[#FF8315] px-3 py-2 text-xs font-medium text-white hover:bg-[#e66f08] disabled:opacity-60"
                                                                >
                                                                    {updatingCategory
                                                                        ? "Saving..."
                                                                        : "Save"}
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditingCategoryId(null);
                                                                        setEditingCategoryName("");
                                                                    }}
                                                                    disabled={updatingCategory}
                                                                    className="rounded-lg border border-[#D8D4C9] px-3 py-2 text-xs font-medium text-black hover:bg-[#F8F7F2]"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setEditingCategoryId(category.id);
                                                                    setEditingCategoryName(category.name);
                                                                    setCategoriesError("");
                                                                }}
                                                                className="rounded-lg border border-[#D8D4C9] px-3 py-2 text-xs font-medium text-black hover:bg-[#F8F7F2]"
                                                            >
                                                                Edit
                                                            </button>

                                                            
                                                        )}
                                                        <button
    type="button"
    onClick={() => handleDeleteCategory(category.id)}
    disabled={deletingCategoryId === category.id}
    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
>
    {deletingCategoryId === category.id
        ? "Deleting..."
        : "Delete"}
</button>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-dashed border-[#D8D4C9] p-6 text-center">
                                <p className="text-sm text-[#6F6B63]">
                                    Expense categories will appear here.
                                </p>
                            </div>
                        </section>

                        {/* Account */}
                        <section className="rounded-2xl border border-[#E3DFD5] bg-white p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0E2]">
                                    <LogOut className="h-5 w-5 text-[#FF8315]" />
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold text-black">
                                        Account
                                    </h2>

                                    <p className="text-sm text-[#6F6B63]">
                                        Manage your Pocket Tracker session.
                                    </p>
                                </div>
                            </div>

                            <button
    type="button"
    onClick={() =>
        signOut({
            callbackUrl: "/login",
        })
    }
    className="rounded-xl border border-[#D8D4C9] px-5 py-3 text-sm font-medium text-black transition hover:bg-[#F8F7F2]"
>
    Logout
</button>
                        </section>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}