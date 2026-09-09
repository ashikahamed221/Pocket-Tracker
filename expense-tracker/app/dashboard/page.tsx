"use client";

import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

type DashboardData = {
    success: boolean;

    summary: {
        income: number;
        expenses: number;
        savings: number;
    };

    today: {
        income: number;
        expenses: number;
        savings: number;
    } | null;

    dailySummary: {
        date: string;
        income: number;
        expenses: number;
        savings: number;
    }[];

    expensesByCategory: {
        categoryId: string;
        categoryName: string;
        amount: number;
    }[];
};

type Transaction = {
    id: string;
    type: "INCOME" | "EXPENSE";
    amount: number;
    date: string;
    note: string | null;
    category: {
        id: string;
        name: string;
    } | null;
};

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    function getCurrentMonth() {
        const now = new Date();

        return `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(2, "0")}`;
    }

    useEffect(() => {
        async function fetchDashboard() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `/api/dashboard?month=${selectedMonth}`
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "Failed to load dashboard"
                    );
                }

                setData(result);

                const transactionResponse = await fetch(
                    `/api/transactions?month=${selectedMonth}&limit=5`
                );

                const transactionResult = await transactionResponse.json();

                if (!transactionResponse.ok) {
                    throw new Error(
                        transactionResult.message ||
                        "Failed to load transactions"
                    );
                }

                setTransactions(transactionResult.transactions);
            } catch (error) {
                console.error("Dashboard fetch error:", error);

                setError("Failed to load dashboard");
            } finally {
                setLoading(false);
            }
        }

        fetchDashboard();
    }, [selectedMonth]);

    if (loading) {
        return (
            <main className="p-6">
                <p>Loading dashboard...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="p-6">
                <p>{error}</p>
            </main>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <main className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Dashboard
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Track your income, expenses and savings.
                    </p>
                </div>

                <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => {
                        const value = e.target.value;

                        setSelectedMonth(value || getCurrentMonth());
                    }}
                    className="rounded-lg border bg-white px-3 py-2 text-sm"
                />

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Income */}
                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">
                            Total Income
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-gray-900">
                            ₹{data.summary.income.toLocaleString("en-IN")}
                        </h2>
                    </div>

                    {/* Expenses */}
                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">
                            Total Expenses
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-gray-900">
                            ₹{data.summary.expenses.toLocaleString("en-IN")}
                        </h2>
                    </div>

                    {/* Savings */}
                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">
                            Savings
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-gray-900">
                            ₹{data.summary.savings.toLocaleString("en-IN")}
                        </h2>
                    </div>
                </div>

                // stat

                <div className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Daily Savings
                        </h2>

                        <p className="text-sm text-gray-500">
                            Your running savings throughout the month.
                        </p>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.dailySummary}>
                                <CartesianGrid strokeDasharray="3 3" />

                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) =>
                                        new Date(date).getDate().toString()
                                    }
                                />

                                <YAxis />

                                <Tooltip />

                                <Line
                                    type="monotone"
                                    dataKey="savings"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Recent Transactions
                        </h2>

                        <p className="text-sm text-gray-500">
                            Your latest income and expenses.
                        </p>
                    </div>

                    {transactions.length === 0 ? (
                        <p className="py-8 text-center text-sm text-gray-500">
                            No transactions found for this month.
                        </p>
                    ) : (
                        <div className="divide-y">
                            {transactions.map((transaction) => (
                                <div
                                    key={`${transaction.type}-${transaction.id}`}
                                    className="flex items-center justify-between py-4"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {transaction.note ||
                                                (transaction.type === "INCOME"
                                                    ? "Income"
                                                    : "Expense")}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            {new Date(
                                                transaction.date
                                            ).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}

                                            {transaction.category &&
                                                ` • ${transaction.category.name}`}
                                        </p>
                                    </div>

                                    <p
                                        className={`font-semibold ${transaction.type === "INCOME"
                                                ? "text-green-600"
                                                : "text-red-600"
                                            }`}
                                    >
                                        {transaction.type === "INCOME"
                                            ? "+"
                                            : "-"}
                                        ₹
                                        {transaction.amount.toLocaleString(
                                            "en-IN"
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