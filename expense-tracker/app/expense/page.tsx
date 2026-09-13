"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, Wallet } from "lucide-react";

import DashboardLayout from "@/src/components/dashboard/DashboardLayout";

type Category = {
    id: string;
    name: string;
};

type Expense = {
    id: string;
    amount: number;
    date: string;
    note: string | null;
    category: {
        id: string;
        name: string;
    };
};

export default function ExpensePage() {
    const [amount, setAmount] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [date, setDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [note, setNote] = useState("");

    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loadingExpenses, setLoadingExpenses] = useState(true);
    const [editingExpense, setEditingExpense] =
        useState<Expense | null>(null);

    const [editAmount, setEditAmount] = useState("");
    const [editCategoryId, setEditCategoryId] = useState("");
    const [editDate, setEditDate] = useState("");
    const [editNote, setEditNote] = useState("");

    const [actionLoading, setActionLoading] = useState(false);

    async function fetchExpenses() {
        try {
            setLoadingExpenses(true);

            const response = await fetch("/api/expenses");
            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to load expenses"
                );
            }

            setExpenses(result.expenses);
        } catch (error) {
            console.error("Fetch expenses error:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load expenses"
            );
        } finally {
            setLoadingExpenses(false);
        }
    }

    async function fetchCategories() {
        try {
            setLoadingCategories(true);

            const response = await fetch("/api/categories");
            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to load categories"
                );
            }

            setCategories(result.categories);
        } catch (error) {
            console.error("Fetch categories error:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load categories"
            );
        } finally {
            setLoadingCategories(false);
        }
    }

    async function handleEditExpense() {
        if (!editingExpense) return;

        setError("");
        setMessage("");

        try {
            setActionLoading(true);

            const response = await fetch(
                `/api/expenses/${editingExpense.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        amount: Number(editAmount),
                        categoryId: editCategoryId,
                        date: editDate,
                        note: editNote.trim(),
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to update expense"
                );
            }

            setMessage("Expense updated successfully.");

            setEditingExpense(null);

            await fetchExpenses();
        } catch (error) {
            console.error("Update expense error:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to update expense"
            );
        } finally {
            setActionLoading(false);
        }
    }

    // Delete expenses

    async function handleDeleteExpense(id: string) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this expense?"
        );

        if (!confirmed) return;

        setError("");
        setMessage("");

        try {
            setActionLoading(true);

            const response = await fetch(
                `/api/expenses/${id}`,
                {
                    method: "DELETE",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to delete expense"
                );
            }

            setMessage("Expense deleted successfully.");

            await fetchExpenses();
        } catch (error) {
            console.error("Delete expense error:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete expense"
            );
        } finally {
            setActionLoading(false);
        }
    }

    useEffect(() => {
        fetchCategories();
        fetchExpenses();
    }, []);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setMessage("");
        setError("");

        try {
            setLoading(true);

            const response = await fetch("/api/expenses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: Number(amount),
                    categoryId,
                    date,
                    note: note.trim() || undefined,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to add expense"
                );
            }

            setMessage("Expense added successfully.");

            // Reset form
            setAmount("");
            setCategoryId("");
            setDate(
                new Date().toISOString().split("T")[0]
            );
            setNote("");
            await fetchExpenses();
        } catch (error) {
            console.error("Add expense error:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to add expense"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <DashboardLayout>
            <main className="min-h-screen bg-[#F8F7F2] p-5 pb-24 md:p-8 lg:pb-8">
                <div className="mx-auto max-w-3xl">
                    {/* Header */}
                    <div className="mb-8">
                        <p className="mb-2 text-sm font-medium text-[#FF3B0A]">
                            Expense
                        </p>

                        <h1 className="text-3xl font-semibold tracking-tight text-black md:text-4xl">
                            Add an expense
                        </h1>

                        <p className="mt-2 text-sm text-[#6F6B63]">
                            Record where your money is going.
                        </p>
                    </div>

                    {/* Expense Form */}
                    <div className="rounded-3xl border border-[#DDD9CF] bg-white p-6 shadow-sm md:p-8">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFE9E3]">
                                <ArrowUpRight className="h-5 w-5 text-[#FF3B0A]" />
                            </div>

                            <div>
                                <h2 className="font-semibold text-black">
                                    Expense details
                                </h2>

                                <p className="text-sm text-[#777269]">
                                    Enter the details of your expense.
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            {/* Amount */}
                            <div>
                                <label
                                    htmlFor="amount"
                                    className="mb-2 block text-sm font-medium text-black"
                                >
                                    Amount
                                </label>

                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#6F6B63]">
                                        ₹
                                    </span>

                                    <input
                                        id="amount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={amount}
                                        onChange={(event) =>
                                            setAmount(event.target.value)
                                        }
                                        placeholder="0.00"
                                        required
                                        className="w-full rounded-xl border border-[#D8D4C9] bg-white py-3 pl-9 pr-4 text-sm text-black outline-none transition placeholder:text-[#AAA59A] focus:border-[#FF3B0A] focus:ring-2 focus:ring-[#FF3B0A]/10"
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label
                                    htmlFor="category"
                                    className="mb-2 block text-sm font-medium text-black"
                                >
                                    Category
                                </label>

                                <select
                                    id="category"
                                    value={categoryId}
                                    onChange={(event) =>
                                        setCategoryId(event.target.value)
                                    }
                                    required
                                    disabled={loadingCategories}
                                    className="w-full rounded-xl border border-[#D8D4C9] bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#FF3B0A] focus:ring-2 focus:ring-[#FF3B0A]/10 disabled:cursor-not-allowed disabled:bg-[#F8F7F2]"
                                >
                                    <option value="">
                                        {loadingCategories
                                            ? "Loading categories..."
                                            : "Select a category"}
                                    </option>

                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date */}
                            <div>
                                <label
                                    htmlFor="date"
                                    className="mb-2 block text-sm font-medium text-black"
                                >
                                    Date
                                </label>

                                <div className="relative">
                                    <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6F6B63]" />

                                    <input
                                        id="date"
                                        type="date"
                                        value={date}
                                        onChange={(event) =>
                                            setDate(event.target.value)
                                        }
                                        required
                                        className="w-full rounded-xl border border-[#D8D4C9] bg-white px-4 py-3 pl-11 text-sm text-black outline-none transition focus:border-[#FF3B0A] focus:ring-2 focus:ring-[#FF3B0A]/10"
                                    />
                                </div>
                            </div>

                            {/* Note */}
                            <div>
                                <label
                                    htmlFor="note"
                                    className="mb-2 block text-sm font-medium text-black"
                                >
                                    Note
                                </label>

                                <textarea
                                    id="note"
                                    value={note}
                                    onChange={(event) =>
                                        setNote(event.target.value)
                                    }
                                    placeholder="What was this expense for?"
                                    rows={4}
                                    className="w-full resize-none rounded-xl border border-[#D8D4C9] bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-[#AAA59A] focus:border-[#FF3B0A] focus:ring-2 focus:ring-[#FF3B0A]/10"
                                />
                            </div>

                            {/* Messages */}
                            {message && (
                                <p className="rounded-xl bg-[#F1F8EF] px-4 py-3 text-sm font-medium text-green-700">
                                    {message}
                                </p>
                            )}

                            {error && (
                                <p className="rounded-xl bg-[#FFE9E3] px-4 py-3 text-sm font-medium text-[#FF3B0A]">
                                    {error}
                                </p>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF3B0A] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#E83205] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Wallet className="h-4 w-4" />
                                {loading
                                    ? "Adding expense..."
                                    : "Add Expense"}
                            </button>
                        </form>
                    </div>
                </div>

                {/*  edit expense Form */}

                {/* Edit Expense */}
                {editingExpense && (
                    <div className="mt-6 rounded-3xl border border-[#DDD9CF] bg-white p-6 shadow-sm md:p-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-black">
                                Edit Expense
                            </h2>

                            <p className="mt-1 text-sm text-[#6F6B63]">
                                Update your expense details.
                            </p>
                        </div>

                        <div className="space-y-5">
                            {/* Amount */}
                            <div>
                                <label
                                    htmlFor="edit-amount"
                                    className="mb-2 block text-sm font-medium text-black"
                                >
                                    Amount
                                </label>

                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#6F6B63]">
                                        ₹
                                    </span>

                                    <input
                                        id="edit-amount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editAmount}
                                        onChange={(event) =>
                                            setEditAmount(event.target.value)
                                        }
                                        required
                                        className="w-full rounded-xl border border-[#D8D4C9] bg-white py-3 pl-9 pr-4 text-sm text-black outline-none transition placeholder:text-[#AAA59A] focus:border-[#FF3B0A] focus:ring-2 focus:ring-[#FF3B0A]/10"
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label
                                    htmlFor="edit-category"
                                    className="mb-2 block text-sm font-medium text-black"
                                >
                                    Category
                                </label>

                                <select
                                    id="edit-category"
                                    value={editCategoryId}
                                    onChange={(event) =>
                                        setEditCategoryId(event.target.value)
                                    }
                                    required
                                    className="w-full rounded-xl border border-[#D8D4C9] bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#FF3B0A] focus:ring-2 focus:ring-[#FF3B0A]/10"
                                >
                                    <option value="">
                                        Select a category
                                    </option>

                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date */}
                            <div>
                                <label
                                    htmlFor="edit-date"
                                    className="mb-2 block text-sm font-medium text-black"
                                >
                                    Date
                                </label>

                                <input
                                    id="edit-date"
                                    type="date"
                                    value={editDate}
                                    onChange={(event) =>
                                        setEditDate(event.target.value)
                                    }
                                    required
                                    className="w-full rounded-xl border border-[#D8D4C9] bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#FF3B0A] focus:ring-2 focus:ring-[#FF3B0A]/10"
                                />
                            </div>

                            {/* Note */}
                            <div>
                                <label
                                    htmlFor="edit-note"
                                    className="mb-2 block text-sm font-medium text-black"
                                >
                                    Note
                                </label>

                                <textarea
                                    id="edit-note"
                                    value={editNote}
                                    onChange={(event) =>
                                        setEditNote(event.target.value)
                                    }
                                    rows={4}
                                    className="w-full resize-none rounded-xl border border-[#D8D4C9] bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-[#AAA59A] focus:border-[#FF3B0A] focus:ring-2 focus:ring-[#FF3B0A]/10"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={handleEditExpense}
                                    disabled={actionLoading}
                                    className="flex-1 rounded-xl bg-[#FF3B0A] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#E83205] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {actionLoading
                                        ? "Updating..."
                                        : "Update Expense"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setEditingExpense(null)}
                                    disabled={actionLoading}
                                    className="flex-1 rounded-xl border border-[#D8D4C9] bg-white px-5 py-3.5 text-sm font-semibold text-[#6F6B63] transition hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* // fetch and display expenses */}

                {/* Expense History */}
                <div className="mt-8">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold text-black">
                            Expense History
                        </h2>

                        <p className="mt-1 text-sm text-[#6F6B63]">
                            Your recent expenses.
                        </p>
                    </div>

                    {loadingExpenses ? (
                        <div className="rounded-2xl border border-[#DDD9CF] bg-white p-6 text-center text-sm text-[#6F6B63]">
                            Loading expenses...
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="rounded-2xl border border-[#DDD9CF] bg-white p-6 text-center text-sm text-[#6F6B63]">
                            No expenses found.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {expenses.map((expense) => (
                                <div
                                    key={expense.id}
                                    className="flex items-center justify-between rounded-2xl border border-[#DDD9CF] bg-white p-4 shadow-sm"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFE9E3]">
                                            <ArrowUpRight className="h-4 w-4 text-[#FF3B0A]" />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="font-medium text-black">
                                                {expense.category.name}
                                            </p>

                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#777269]">
                                                <span>
                                                    {new Date(
                                                        expense.date
                                                    ).toLocaleDateString("en-IN", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </span>

                                                {expense.note && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="truncate">
                                                            {expense.note}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ml-4 flex shrink-0 items-center gap-3">
                                        <p className="font-semibold text-[#FF3B0A]">
                                            -₹
                                            {Number(expense.amount).toLocaleString("en-IN")}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingExpense(expense);
                                                setEditAmount(expense.amount.toString());
                                                setEditCategoryId(expense.category.id);
                                                setEditDate(
                                                    new Date(expense.date)
                                                        .toISOString()
                                                        .split("T")[0]
                                                );
                                                setEditNote(expense.note || "");
                                                setMessage("");
                                                setError("");
                                            }}
                                            className="rounded-lg border border-[#D8D4C9] px-3 py-1.5 text-xs font-medium text-[#6F6B63] transition hover:border-[#FF8315] hover:text-[#FF8315]"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            disabled={actionLoading}
                                            onClick={() =>
                                                handleDeleteExpense(expense.id)
                                            }
                                            className="rounded-lg border border-[#FFD2C8] px-3 py-1.5 text-xs font-medium text-[#FF3B0A] transition hover:bg-[#FFE9E3] disabled:opacity-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </DashboardLayout>
    );
}