"use client";

import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import DashboardLayout from "@/src/components/dashboard/DashboardLayout";

type Transaction = {
    id: string;
    type: "INCOME" | "EXPENSE";
    amount: number;
    date: string;
    note: string | null;
    category?: {
        id: string;
        name: string;
    } | null;
};

export default function HistoryPage() {
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();

        return `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(2, "0")}`;
    });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState<
        "all" | "income" | "expense"
    >("all");

    async function fetchTransactions() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `/api/transactions?month=${selectedMonth}`
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to load transactions"
                );
            }

            setTransactions(result.transactions);
        } catch (error) {
            console.error("Fetch transactions error:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load transactions"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTransactions();
    }, [selectedMonth]);

    const filteredTransactions =
        filter === "all"
            ? transactions
            : transactions.filter(
                (transaction) =>
                    transaction.type.toLowerCase() === filter
            );

    return (
        <DashboardLayout>
            <main className="min-h-screen bg-[#F8F7F2] p-5 pb-24 md:p-8 lg:pb-8">
                <div className="mx-auto max-w-5xl">
                    {/* Header */}
                    <div className="mb-8">
                        <p className="mb-2 text-sm font-medium text-[#FF8315]">
                            Transactions
                        </p>

                        <h1 className="text-3xl font-semibold tracking-tight text-black md:text-4xl">
                            Transaction History
                        </h1>

                        <p className="mt-2 text-sm text-[#6F6B63]">
                            View all your income and expenses in one place.
                        </p>
                    </div>

                    {/* Month Filter */}
                    <div className="mb-6 flex flex-col gap-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-lg font-semibold text-black">
                                Transactions
                            </h2>

                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(event) =>
                                    setSelectedMonth(event.target.value)
                                }
                                className="rounded-xl border border-[#D8D4C9] bg-white px-4 py-2.5 text-sm text-black outline-none transition focus:border-[#FF8315] focus:ring-2 focus:ring-[#FF8315]/10"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: "All", value: "all" },
                                { label: "Income", value: "income" },
                                { label: "Expense", value: "expense" },
                            ].map((item) => (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() =>
                                        setFilter(
                                            item.value as
                                            | "all"
                                            | "income"
                                            | "expense"
                                        )
                                    }
                                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${filter === item.value
                                        ? "bg-black text-white"
                                        : "border border-[#D8D4C9] bg-white text-[#6F6B63] hover:border-black hover:text-black"
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>



                    {/* Temporary Empty State */}
                    {/* Transactions */}
                    {loading ? (
                        <div className="rounded-3xl border border-[#DDD9CF] bg-white p-8 text-center shadow-sm">
                            <p className="text-sm text-[#6F6B63]">
                                Loading transactions...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="rounded-3xl border border-[#FFD2C8] bg-white p-8 text-center shadow-sm">
                            <p className="text-sm font-medium text-[#FF3B0A]">
                                {error}
                            </p>
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="rounded-3xl border border-[#DDD9CF] bg-white p-8 text-center shadow-sm">
                            <p className="font-medium text-black">
                                No transactions found
                            </p>

                            <p className="mt-1 text-sm text-[#6F6B63]">
                                No income or expenses were recorded for this month.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredTransactions.map((transaction) => {
                                const isIncome = transaction.type === "INCOME";

                                return (
                                    <div
                                        key={`${transaction.type}-${transaction.id}`}
                                        className="flex items-center justify-between rounded-2xl border border-[#DDD9CF] bg-white p-4 shadow-sm"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div
                                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isIncome
                                                    ? "bg-[#FFF1E4]"
                                                    : "bg-[#FFE9E3]"
                                                    }`}
                                            >
                                                {isIncome ? (
                                                    <ArrowDownLeft
                                                        className="h-4 w-4 text-[#FF8315]"
                                                    />
                                                ) : (
                                                    <ArrowUpRight
                                                        className="h-4 w-4 text-[#FF3B0A]"
                                                    />
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="font-medium text-black">
                                                    {isIncome
                                                        ? transaction.note || "Income"
                                                        : transaction.category?.name ||
                                                        "Expense"}
                                                </p>

                                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#777269]">
                                                    <span>
                                                        {new Date(
                                                            transaction.date
                                                        ).toLocaleDateString(
                                                            "en-IN",
                                                            {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                            }
                                                        )}
                                                    </span>

                                                    {transaction.note &&
                                                        !isIncome && (
                                                            <>
                                                                <span>•</span>

                                                                <span className="truncate">
                                                                    {transaction.note}
                                                                </span>
                                                            </>
                                                        )}
                                                </div>
                                            </div>
                                        </div>

                                        <p
                                            className={`ml-4 shrink-0 font-semibold ${isIncome
                                                ? "text-[#FF8315]"
                                                : "text-[#FF3B0A]"
                                                }`}
                                        >
                                            {isIncome ? "+" : "-"}₹
                                            {Number(
                                                transaction.amount
                                            ).toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </DashboardLayout>
    );
}