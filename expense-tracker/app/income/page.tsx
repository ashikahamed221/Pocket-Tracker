"use client";

import {
    FormEvent,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    ArrowDownLeft,
    CalendarDays,
    Wallet,
} from "lucide-react";

import DashboardLayout from "@/src/components/dashboard/DashboardLayout";

type Income = {
    id: string;
    amount: number;
    date: string;
    note: string | null;
};

function formatCurrency(amount: number) {
    return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export default function IncomePage() {
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [note, setNote] = useState("");

    const [incomes, setIncomes] = useState<Income[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingIncomes, setLoadingIncomes] = useState(true);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [editingIncome, setEditingIncome] =
        useState<Income | null>(null);

    const editFormRef = useRef<HTMLDivElement>(null);

    const [editAmount, setEditAmount] = useState("");
    const [editDate, setEditDate] = useState("");
    const [editNote, setEditNote] = useState("");

    const [actionLoading, setActionLoading] = useState(false);

    async function fetchIncomes() {
        try {
            setLoadingIncomes(true);

            const response = await fetch("/api/income");

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to load income"
                );
            }

            setIncomes(result.incomes);
        } catch (error) {
            console.error("Fetch income error:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load income"
            );
        } finally {
            setLoadingIncomes(false);
        }
    }

    useEffect(() => {
        fetchIncomes();
    }, []);

    useEffect(() => {
        if (!editingIncome) return;

        requestAnimationFrame(() => {
            editFormRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        });
    }, [editingIncome]);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setMessage("");
        setError("");

        try {
            setLoading(true);

            const response = await fetch("/api/income", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: Number(amount),
                    date,
                    note: note.trim() || undefined,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to add income"
                );
            }

            setMessage("Income added successfully.");

            setAmount("");
            setNote("");
            setDate(
                new Date().toISOString().split("T")[0]
            );

            // Refresh income history
            await fetchIncomes();
        } catch (error) {
            console.error("Add income error:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to add income"
            );
        } finally {
            setLoading(false);
        }
    }

    // edit income

    async function handleEditIncome() {
        if (!editingIncome) return;

        setError("");
        setMessage("");

        try {
            setActionLoading(true);

            const response = await fetch(
                `/api/income/${editingIncome.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        amount: Number(editAmount),
                        date: editDate,
                        note: editNote.trim(),
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to update income"
                );
            }

            setMessage("Income updated successfully.");

            setEditingIncome(null);

            await fetchIncomes();
        } catch (error) {
            console.error("Update income error:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to update income"
            );
        } finally {
            setActionLoading(false);
        }
    }

    async function handleDeleteIncome(id: string) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this income?"
        );

        if (!confirmed) return;

        setError("");
        setMessage("");

        try {
            setActionLoading(true);

            const response = await fetch(
                `/api/income/${id}`,
                {
                    method: "DELETE",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to delete income"
                );
            }

            setMessage("Income deleted successfully.");

            await fetchIncomes();
        } catch (error) {
            console.error("Delete income error:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete income"
            );
        } finally {
            setActionLoading(false);
        }
    }

    // delete all income

    const handleDeleteAllIncome = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete all income records? This action cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(true);
            setMessage("");
            setError("");

            const response = await fetch("/api/income", {
                method: "DELETE",
            });

            const result = await response.json();

            if (!response.ok) {
                setError(
                    result.message || "Failed to delete all income."
                );
                return;
            }

            setIncomes([]);
            setMessage(
                `${result.deletedCount} income record${result.deletedCount !== 1 ? "s" : ""
                } deleted successfully.`
            );
        } catch (error) {
            console.error("Delete all income error:", error);
            setError("Something went wrong. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

      

    return (

        <DashboardLayout>
            <main className="min-h-screen bg-[#F8F7F2] p-5 pb-24 md:p-8 lg:pb-8">
                <div className="mx-auto max-w-5xl">

                    {/* Header */}
                    <div className="mb-7">
                        <h1 className="text-3xl font-semibold tracking-tight text-black">
                            Income
                        </h1>

                        <p className="mt-1 text-sm text-[#6F6B63]">
                            Add and manage your income.
                        </p>
                    </div>

                    {/* Add Income Card */}
                    <div className="rounded-2xl border border-[#DDD9CF] bg-white p-6 shadow-sm md:p-8">

                        {/* Card Header */}
                        <div className="mb-6 flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF0E5]">
                                <Wallet className="h-5 w-5 text-[#FF8315]" />
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-black">
                                    Add Income
                                </h2>

                                <p className="text-sm text-[#777269]">
                                    Record money you received.
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
                                    className="mb-2 block text-sm font-medium text-gray-900"
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
                                        onChange={(e) =>
                                            setAmount(
                                                e.target.value
                                            )
                                        }
                                        placeholder="0.00"
                                        required
                                        className="w-full rounded-xl border border-[#D8D4C9] bg-white py-3 pl-9 pr-4 text-sm text-black outline-none transition placeholder:text-[#AAA59A] focus:border-[#FF8315] focus:ring-2 focus:ring-[#FF8315]/20"
                                    />
                                </div>
                            </div>

                            {/* Date */}
                            <div>
                                <label
                                    htmlFor="date"
                                    className="mb-2 block text-sm font-medium text-gray-900"
                                >
                                    Date
                                </label>

                                <div className="relative">
                                    <CalendarDays className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6F6B63]" />

                                    <input
                                        id="date"
                                        type="date"
                                        value={date}
                                        onChange={(e) =>
                                            setDate(
                                                e.target.value
                                            )
                                        }
                                        required
                                        className="w-full rounded-xl border border-[#D8D4C9] bg-white py-3 pl-11 pr-4 text-sm text-black outline-none transition focus:border-[#FF8315] focus:ring-2 focus:ring-[#FF8315]/20"
                                    />
                                </div>
                            </div>

                            {/* Note */}
                            <div>
                                <label
                                    htmlFor="note"
                                    className="mb-2 block text-sm font-medium text-gray-900"
                                >
                                    Note
                                </label>

                                <input
                                    id="note"
                                    type="text"
                                    value={note}
                                    onChange={(e) =>
                                        setNote(e.target.value)
                                    }
                                    placeholder="Salary, Freelance..."
                                    maxLength={500}
                                    className="w-full rounded-xl border border-[#D8D4C9] bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-[#AAA59A] focus:border-[#FF8315] focus:ring-2 focus:ring-[#FF8315]/20"
                                />
                            </div>

                            {/* Messages */}
                            {message && (
                                <p className="rounded-xl bg-[#FFF0E5] px-4 py-3 text-sm font-medium text-[#D95F00]">
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
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF8315] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#FF3B0A] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                            >
                                <ArrowDownLeft className="h-4 w-4" />

                                {loading
                                    ? "Adding..."
                                    : "Add Income"}
                            </button>
                        </form>
                    </div>

                    {editingIncome && (
                        <div ref={editFormRef} className="scroll-mt-6 mt-6 rounded-2xl border border-[#DDD9CF] bg-white p-6 shadow-sm md:p-8">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-black">
                                    Edit Income
                                </h2>

                                <p className="mt-1 text-sm text-[#777269]">
                                    Update your income transaction.
                                </p>
                            </div>

                            <div className="space-y-5">
                                {/* Amount */}
                                <div>
                                    <label
                                        htmlFor="editAmount"
                                        className="mb-2 block text-sm font-medium text-gray-900"
                                    >
                                        Amount
                                    </label>

                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#6F6B63]">
                                            ₹
                                        </span>

                                        <input
                                            id="editAmount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={editAmount}
                                            onChange={(e) =>
                                                setEditAmount(
                                                    e.target.value
                                                )
                                            }

                                            className="w-full rounded-xl border border-[#D8D4C9] bg-white py-3 pl-9 pr-4 text-sm text-black outline-none transition focus:border-[#FF8315] focus:ring-2 focus:ring-[#FF8315]/20"
                                        />
                                    </div>
                                </div>

                                {/* Date */}
                                <div>
                                    <label
                                        htmlFor="editDate"
                                        className="mb-2 block text-sm font-medium text-gray-900"
                                    >
                                        Date
                                    </label>

                                    <input
                                        id="editDate"
                                        type="date"
                                        value={editDate}
                                        onChange={(e) =>
                                            setEditDate(e.target.value)
                                        }
                                        className="w-full rounded-xl border border-[#D8D4C9] bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#FF8315] focus:ring-2 focus:ring-[#FF8315]/20"
                                    />
                                </div>

                                {/* Note */}
                                <div>
                                    <label
                                        htmlFor="editNote"
                                        className="mb-2 block text-sm font-medium text-gray-900"
                                    >
                                        Note
                                    </label>

                                    <input
                                        id="editNote"
                                        type="text"
                                        value={editNote}
                                        onChange={(e) =>
                                            setEditNote(e.target.value)
                                        }
                                        maxLength={500}
                                        className="w-full rounded-xl border border-[#D8D4C9] bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#FF8315] focus:ring-2 focus:ring-[#FF8315]/20"
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={handleEditIncome}
                                        className="rounded-xl bg-[#FF8315] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#FF3B0A] disabled:opacity-50"
                                    >
                                        {actionLoading
                                            ? "Updating..."
                                            : "Update Income"}
                                    </button>

                                    <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={() =>
                                            setEditingIncome(null)
                                        }
                                        className="rounded-xl border border-[#D8D4C9] bg-white px-5 py-3 text-sm font-semibold text-[#6F6B63] transition hover:bg-[#F8F7F2] disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Income History */}
                    <div className="mt-6">

                        <div className="mb-3">
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-black">
                                        Income History
                                    </h2>
                                    <p className="mt-1 text-sm text-[#777269]">
                                        {incomes.length} income record
                                        {incomes.length !== 1 ? "s" : ""}
                                    </p>
                                </div>

                                {incomes.length > 0 && (
                                    <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={handleDeleteAllIncome}
                                        className="shrink-0 rounded-lg border border-[#FFD2C8] px-3 py-2 text-xs font-medium text-[#FF3B0A] transition hover:bg-[#FFE9E3] disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
                                    >
                                        Delete All
                                    </button>
                                )}
                            </div>

                            <p className="mt-1 text-sm text-[#6F6B63]">
                                Your latest income transactions.
                            </p>
                        </div>

                        {loadingIncomes ? (
                            <div className="rounded-2xl border border-[#DDD9CF] bg-white p-8 text-center shadow-sm">
                                <p className="text-sm text-[#777269]">
                                    Loading income...
                                </p>
                            </div>
                        ) : incomes.length === 0 ? (
                            <div className="rounded-2xl border border-[#DDD9CF] bg-white p-8 text-center shadow-sm">
                                <p className="text-sm text-[#777269]">
                                    No income records found.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {incomes.map((income) => (
                                    <div
                                        key={income.id}
                                        className="rounded-2xl border border-[#DDD9CF] bg-white p-4 shadow-sm transition hover:border-[#C0B9A7] sm:p-5"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Icon */}
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFF0E5]">
                                                <ArrowDownLeft className="h-5 w-5 text-[#FF8315]" />
                                            </div>

                                            {/* Income details */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium text-black">
                                                            {income.note || "Income"}
                                                        </p>

                                                        <p className="mt-1 text-sm text-[#777269]">
                                                            {formatDate(income.date)}
                                                        </p>
                                                    </div>

                                                    {/* Amount */}
                                                    <p className="shrink-0 text-base font-semibold text-[#FF8315]">
                                                        +{formatCurrency(income.amount)}
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div className="mt-4  flex items-center gap-2">
                                                    {/* Edit */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingIncome(income);

                                                            setEditAmount(
                                                                income.amount.toString()
                                                            );

                                                            setEditDate(
                                                                new Date(income.date)
                                                                    .toISOString()
                                                                    .split("T")[0]
                                                            );

                                                            setEditNote(
                                                                income.note || ""
                                                            );

                                                            setMessage("");
                                                            setError("");

                                                        }}
                                                        className="rounded-lg border border-[#D8D4C9] px-3 py-1.5 text-xs font-medium text-[#6F6B63] transition hover:border-[#FF8315] hover:text-[#FF8315]"
                                                    >
                                                        Edit
                                                    </button>

                                                    {/* Delete */}
                                                    <button
                                                        type="button"
                                                        disabled={actionLoading}
                                                        onClick={() =>
                                                            handleDeleteIncome(income.id)
                                                        }
                                                        className="rounded-lg border border-[#FFD2C8] px-3 py-1.5 text-xs font-medium text-[#FF3B0A] transition hover:bg-[#FFE9E3] disabled:opacity-50"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                     </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </DashboardLayout>
    );
}