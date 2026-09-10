"use client";

import { FormEvent, useEffect, useState } from "react";
import {
    ArrowDownLeft,
    CalendarDays,
    Wallet,
} from "lucide-react";

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

    return (
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
                                placeholder="Salary, Rapido, Freelance..."
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

                {/* Income History */}
                <div className="mt-6">

                    <div className="mb-3">
                        <h2 className="text-base font-semibold text-black">
                            Income history
                        </h2>

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
                                    className="flex items-center justify-between rounded-2xl border border-[#DDD9CF] bg-white px-5 py-4 shadow-sm transition hover:border-[#C0B9A7]"
                                >
                                    <div className="flex min-w-0 items-center gap-4">

                                        {/* Icon */}
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFF0E5]">
                                            <ArrowDownLeft className="h-5 w-5 text-[#FF8315]" />
                                        </div>

                                        {/* Details */}
                                        <div className="min-w-0">
                                            <p className="truncate font-medium text-black">
                                                {income.note ||
                                                    "Income"}
                                            </p>

                                            <p className="mt-1 text-sm text-[#777269]">
                                                {formatDate(
                                                    income.date
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <p className="ml-4 shrink-0 font-semibold text-[#FF8315]">
                                        +
                                        {formatCurrency(
                                            income.amount
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}