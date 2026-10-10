"use client";

import {
    FolderOpen,
    LogOut,
    Moon,
    Sun,
    User,
} from "lucide-react";

import DashboardLayout from "@/src/components/dashboard/DashboardLayout";

import { useEffect, useState, useSyncExternalStore } from "react";

import { signOut } from "next-auth/react";

import { useTheme } from "@/src/components/ThemeProvider";

const subscribeToNothing = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;



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

    const { resolvedTheme, setTheme } = useTheme();
    const mounted = useSyncExternalStore(
        subscribeToNothing,
        getClientSnapshot,
        getServerSnapshot
    );
    const isDarkMode = mounted && resolvedTheme === "dark";

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
            <div className="min-h-screen bg-[#F8F7F2] px-4 py-6 pb-24 sm:px-6 sm:py-8 lg:px-8 lg:pb-8">
                <div className="mx-auto w-full max-w-4xl">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
                            Settings
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-[#6F6B63]">
                            Manage your account and expense categories.
                        </p>
                    </div>

                    <div className="space-y-4 sm:space-y-5">
                        {/* Profile */}
                        <section className="min-w-0 rounded-2xl border border-[#E3DFD5] bg-white p-4 shadow-sm sm:p-6">
                            <div className="mb-5 flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0E2]">
                                    <User className="h-5 w-5 text-[#FF8315]" />
                                </div>

                                <div className="min-w-0">
                                    <h2 className="text-lg font-semibold text-black">
                                        Profile
                                    </h2>

                                    <p className="text-sm text-[#6F6B63]">
                                        Your account information
                                    </p>
                                </div>
                            </div>

                            <div className="grid min-w-0 gap-4 sm:grid-cols-2 sm:gap-6">
                                <div className="min-w-0">
                                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#8A857B]">
                                        Name
                                    </p>

                                    <p className="break-words text-sm font-medium text-black">
                                        {profileLoading
                                            ? "Loading..."
                                            : profile?.name || "Not available"}
                                    </p>
                                </div>

                                <div className="min-w-0">
                                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#8A857B]">
                                        Email
                                    </p>

                                    <p className="break-all text-sm font-medium text-black">
                                        {profileLoading
                                            ? "Loading..."
                                            : profile?.email || "Not available"}
                                    </p>
                                </div>
                            </div>
                        </section>


                        {/* Appearance */}
                        <section className="min-w-0 rounded-2xl border border-[#E3DFD5] bg-white p-4 shadow-sm sm:p-6">
                            <div className="flex min-w-0 items-center justify-between gap-3 sm:gap-4">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF0E2]">
                                        {isDarkMode ? (
                                            <Moon className="h-5 w-5 text-[#FF8315]" />
                                        ) : (
                                            <Sun className="h-5 w-5 text-[#FF8315]" />
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="text-lg font-semibold text-black">
                                            Appearance
                                        </h2>
                                        <p className="text-sm leading-5 text-[#6F6B63]">
                                            {isDarkMode
                                                ? "Dark mode is on."
                                                : "Easier on the eyes at night."}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={isDarkMode}
                                    aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
                                    disabled={!mounted}
                                    onClick={() => setTheme(isDarkMode ? "light" : "dark")}
                                    className={`relative flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8315] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${
                                        isDarkMode
                                            ? "bg-[#FF8315]"
                                            : "bg-[#D9E2DC]"
                                    }`}
                                >
                                    <span
                                        className={`flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#6F6B63] shadow-sm transition-transform ${
                                            isDarkMode
                                                ? "translate-x-5"
                                                : "translate-x-0"
                                        }`}
                                    >
                                        {isDarkMode ? (
                                            <Moon className="h-3 w-3" aria-hidden="true" />
                                        ) : (
                                            <Sun className="h-3 w-3" aria-hidden="true" />
                                        )}
                                    </span>
                                </button>
                            </div>
                        </section>


                        {/* Expense Categories */}
                        <section className="min-w-0 rounded-2xl border border-[#E3DFD5] bg-white p-4 shadow-sm sm:p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF0E2]">
                                    <FolderOpen className="h-5 w-5 text-[#FF8315]" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-lg font-semibold text-black">
                                        Expense categories
                                    </h2>
                                    <p className="text-sm text-[#6F6B63]">
                                        Organize your spending.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-5 sm:pl-[52px]">
                                {/* Category chips */}
                                {categoriesLoading ? (
                                    <p className="text-sm text-[#6F6B63]">
                                        Loading categories...
                                    </p>
                                ) : categories.length > 0 ? (
                                    <div className="flex min-w-0 flex-wrap gap-2">
                                        {categories.map((category) => (
                                            <div
                                                key={category.id}
                                                className="inline-flex max-w-full min-w-0 items-center gap-2 rounded-full border border-[#D9E4DD] bg-white px-3 py-2 text-sm text-black sm:px-4"
                                            >
                                                <span className="min-w-0 break-all">
                                                    {category.name}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteCategory(category.id)}
                                                    disabled={deletingCategoryId === category.id}
                                                    aria-label={`Delete ${category.name} category`}
                                                    className="shrink-0 text-[#68766D] transition hover:text-red-500 disabled:opacity-50"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-[#6F6B63]">
                                        No categories yet. Add one below to get started.
                                    </p>
                                )}

                                {/* Add category */}
                                <form
                                    className="flex min-w-0 flex-col gap-2 sm:flex-row"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        handleAddCategory();
                                    }}
                                >
                                    <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={(event) => setNewCategoryName(event.target.value)}
                                        placeholder="New category"
                                        className="w-full min-w-0 rounded-xl border border-[#D9E4DD] bg-white px-4 py-3 text-base text-black shadow-sm outline-none transition placeholder:text-[#777269] focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 sm:flex-1"
                                    />

                                    <button
                                        type="submit"
                                        disabled={addingCategory || !newCategoryName.trim()}
                                        className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-400 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                    >
                                        <span className="text-xl leading-none">+</span>
                                        {addingCategory ? "Adding..." : "Add category"}
                                    </button>
                                </form>

                                {categoriesError && (
                                    <p role="alert" className="text-sm text-red-500">
                                        {categoriesError}
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Account */}
                        <section className="min-w-0 rounded-2xl border border-[#E3DFD5] bg-white p-4 shadow-sm sm:p-6">
                            <div className="mb-5 flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF0E2]">
                                    <LogOut className="h-5 w-5 text-[#FF8315]" />
                                </div>

                                <div className="min-w-0">
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
                                className="w-full rounded-xl border border-[#D8D4C9] px-5 py-3 text-sm font-medium text-black transition hover:bg-[#F8F7F2] sm:w-auto"
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