"use client";

import { useEffect, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import {
    ArrowDownLeft,
    ArrowUpRight,
    PiggyBank,
    TrendingDown,
    TrendingUp,
    WalletCards,
} from "lucide-react";

import Sidebar from "@/src/components/dashboard/Sidebar";
import Link from "next/link";

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

/* Pocket Tracker color palette */
const chartColors = [
    "#000000",
    "#FF8315",
    "#FF3B0A",
    "#C0B9A7",
    "#E5E0D5",
    "#8F8878",
];

function getCurrentMonth() {
    const now = new Date();

    return `${now.getFullYear()}-${String(
        now.getMonth() + 1
    ).padStart(2, "0")}`;
}

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

function getShortDay(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
        weekday: "short",
    });
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedMonth, setSelectedMonth] =
        useState(getCurrentMonth);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                setLoading(true);
                setError("");

                const dashboardResponse = await fetch(
                    `/api/dashboard?month=${selectedMonth}`
                );

                const dashboardResult =
                    await dashboardResponse.json();

                if (!dashboardResponse.ok) {
                    throw new Error(
                        dashboardResult.message ||
                        "Failed to load dashboard"
                    );
                }

                setData(dashboardResult);

                const transactionResponse = await fetch(
                    `/api/transactions?month=${selectedMonth}&limit=5`
                );

                const transactionResult =
                    await transactionResponse.json();

                if (!transactionResponse.ok) {
                    throw new Error(
                        transactionResult.message ||
                        "Failed to load transactions"
                    );
                }

                setTransactions(transactionResult.transactions);
            } catch (error) {
                console.error(
                    "Dashboard fetch error:",
                    error
                );

                setError("Failed to load dashboard");
            } finally {
                setLoading(false);
            }
        }

        fetchDashboard();
    }, [selectedMonth]);

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F8F7F2]">
                <p className="text-sm text-[#6F6B63]">
                    Loading dashboard...
                </p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F8F7F2]">
                <p className="text-sm text-[#FF3B0A]">
                    {error}
                </p>
            </main>
        );
    }

    if (!data) {
        return null;
    }

    const today = new Date();

    const todayKey = `${today.getFullYear()}-${String(
        today.getMonth() + 1
    ).padStart(2, "0")}-${String(
        today.getDate()
    ).padStart(2, "0")}`;

    const isCurrentMonth =
        selectedMonth === getCurrentMonth();

    const availableDays = isCurrentMonth
        ? data.dailySummary.filter(
            (item) => item.date <= todayKey
        )
        : data.dailySummary;

    const last7Days = availableDays.slice(-7);

    const spendingData = last7Days.map((item) => ({
        day: getShortDay(item.date),
        amount: item.expenses,
    }));

    return (
        <div className="flex min-h-screen bg-[#F8F7F2]">
            <Sidebar />

            <main className="min-w-0 flex-1 p-5 pb-24 md:p-8 lg:pb-8">
                <div className="mx-auto max-w-7xl">

                    {/* Header */}
                    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight text-black">
                                Dashboard
                            </h1>

                            <p className="mt-1 text-sm text-[#6F6B63]">
                                Track your income, expenses
                                and savings.
                            </p>
                        </div>

                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => {
                                const value =
                                    e.target.value;

                                setSelectedMonth(
                                    value ||
                                    getCurrentMonth()
                                );
                            }}
                            className="w-fit rounded-xl border border-[#D8D4C9] bg-white px-4 py-2.5 text-sm font-medium text-black outline-none transition focus:border-[#FF8315] focus:ring-2 focus:ring-[#FF8315]/20"
                        />
                    </div>

                    {/* Summary Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        {/* Income */}
                        <div className="rounded-2xl border border-[#DDD9CF] bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium uppercase tracking-wide text-[#6F6B63]">
                                        Income
                                    </p>

                                    <h2 className="mt-7 text-2xl font-semibold text-black">
                                        {formatCurrency(
                                            data.summary.income
                                        )}
                                    </h2>

                                    <p className="mt-2 text-sm text-[#777269]">
                                        This month
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF0E5]">
                                    <TrendingUp className="h-5 w-5 text-[#FF8315]" />
                                </div>
                            </div>
                        </div>

                        {/* Expenses */}
                        <div className="rounded-2xl border border-[#DDD9CF] bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium uppercase tracking-wide text-[#6F6B63]">
                                        Expenses
                                    </p>

                                    <h2 className="mt-7 text-2xl font-semibold text-black">
                                        {formatCurrency(
                                            data.summary.expenses
                                        )}
                                    </h2>

                                    <p className="mt-2 text-sm text-[#777269]">
                                        This month
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFE9E3]">
                                    <TrendingDown className="h-5 w-5 text-[#FF3B0A]" />
                                </div>
                            </div>
                        </div>

                        {/* Savings */}
                        <div className="rounded-2xl border border-[#DDD9CF] bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium uppercase tracking-wide text-[#6F6B63]">
                                        Savings
                                    </p>

                                    <h2 className="mt-7 text-2xl font-semibold text-black">
                                        {formatCurrency(
                                            data.summary.savings
                                        )}
                                    </h2>

                                    <p className="mt-2 text-sm text-[#777269]">
                                        Balance
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF0E5]">
                                    <PiggyBank className="h-5 w-5 text-[#FF8315]" />
                                </div>
                            </div>
                        </div>

                        {/* Today */}
                        <div className="rounded-2xl border border-[#DDD9CF] bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium uppercase tracking-wide text-[#6F6B63]">
                                        Today
                                    </p>

                                    <h2 className="mt-7 text-2xl font-semibold text-black">
                                        {data.today
                                            ? formatCurrency(data.today.income)
                                            : "—"}
                                    </h2>

                                    <p className="mt-2 text-sm text-[#777269]">
                                        {data.today
                                            ? `+${formatCurrency(data.today.income)} in`
                                            : "Not applicable"}
                                    </p>

                                    {/* <p className="mt-2 text-sm text-[#777269]">
                                        +
                                        {formatCurrency(
                                            data.today?.income ??
                                            0
                                        )}{" "}
                                        in
                                    </p> */}
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E9E6DE]">
                                    <WalletCards className="h-5 w-5 text-orange-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="mt-6 grid gap-5 lg:grid-cols-2">

                        {/* Category Breakdown */}
                        <div className="rounded-2xl border border-[#DDD9CF] bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-semibold text-black">
                                    Category breakdown
                                </h2>
                            </div>

                            {data.expensesByCategory
                                .length === 0 ? (
                                <div className="flex h-[350px] items-center justify-center">
                                    <p className="text-sm text-[#777269]">
                                        No expenses for this
                                        month.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="h-[280px] w-full">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={
                                                        data.expensesByCategory
                                                    }
                                                    dataKey="amount"
                                                    nameKey="categoryName"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={
                                                        65
                                                    }
                                                    outerRadius={
                                                        100
                                                    }
                                                    paddingAngle={
                                                        1
                                                    }
                                                >
                                                    {data.expensesByCategory.map(
                                                        (
                                                            _,
                                                            index
                                                        ) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={
                                                                    chartColors[
                                                                    index %
                                                                    chartColors.length
                                                                    ]
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </Pie>

                                                <Tooltip
                                                    formatter={(
                                                        value
                                                    ) =>
                                                        formatCurrency(
                                                            Number(
                                                                value
                                                            )
                                                        )
                                                    }
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                                        {data.expensesByCategory.map(
                                            (
                                                category,
                                                index
                                            ) => (
                                                <div
                                                    key={
                                                        category.categoryId
                                                    }
                                                    className="flex items-center justify-between gap-3"
                                                >
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <span
                                                            className="h-3 w-3 shrink-0 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    chartColors[
                                                                    index %
                                                                    chartColors.length
                                                                    ],
                                                            }}
                                                        />

                                                        <span className="truncate text-sm text-[#6F6B63]">
                                                            {
                                                                category.categoryName
                                                            }
                                                        </span>
                                                    </div>

                                                    <span className="text-sm font-medium text-black">
                                                        {formatCurrency(
                                                            category.amount
                                                        )}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Last 7 Days */}
                        <div className="rounded-2xl border border-[#DDD9CF] bg-white p-6 shadow-sm">
                            <h2 className="text-base font-semibold text-black">
                                Last 7 days spending
                            </h2>

                            <div className="mt-5 h-[350px] w-full">
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <BarChart
                                        data={spendingData}
                                        margin={{
                                            top: 10,
                                            right: 10,
                                            left: -20,
                                            bottom: 0,
                                        }}
                                    >
                                        <CartesianGrid
                                            vertical={false}
                                            stroke="#E5E0D5"
                                            strokeDasharray="3 3"
                                        />

                                        <XAxis
                                            dataKey="day"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fill: "#6F6B63",
                                            }}
                                        />

                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fill: "#6F6B63",
                                            }}
                                        />

                                        <Tooltip
                                            formatter={(
                                                value
                                            ) =>
                                                formatCurrency(
                                                    Number(
                                                        value
                                                    )
                                                )
                                            }
                                        />

                                        <Bar
                                            dataKey="amount"
                                            fill="#FF8315"
                                            radius={[
                                                8,
                                                8,
                                                0,
                                                0,
                                            ]}
                                            barSize={55}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="mt-6">

                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-base font-semibold text-black">
                                Recent transactions
                            </h2>

                            <Link
                                href="/history"
                                className="text-sm font-medium text-[#FF8315] transition hover:text-[#FF3B0A]"
                            >
                                View all →
                            </Link>
                        </div>

                        {transactions.length === 0 ? (
                            <div className="rounded-2xl border border-[#DDD9CF] bg-white p-10 text-center shadow-sm">
                                <p className="text-sm text-[#777269]">
                                    No transactions found
                                    for this month.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {transactions.map(
                                    (transaction) => {
                                        const isIncome =
                                            transaction.type ===
                                            "INCOME";

                                        return (
                                            <div
                                                key={`${transaction.type}-${transaction.id}`}
                                                className="flex items-center justify-between rounded-2xl border border-[#DDD9CF] bg-white px-5 py-4 shadow-sm transition hover:border-[#C0B9A7]"
                                            >
                                                <div className="flex min-w-0 items-center gap-4">

                                                    {/* Transaction Icon */}
                                                    <div
                                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${isIncome
                                                            ? "bg-[#FFF0E5]"
                                                            : "bg-[#FFE9E3]"
                                                            }`}
                                                    >
                                                        {isIncome ? (
                                                            <ArrowDownLeft className="h-5 w-5 text-[#FF8315]" />
                                                        ) : (
                                                            <ArrowUpRight className="h-5 w-5 text-[#FF3B0A]" />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium text-black">
                                                            {transaction.note ||
                                                                (isIncome
                                                                    ? "Income"
                                                                    : "Expense")}
                                                        </p>

                                                        <p className="mt-1 truncate text-sm text-[#777269]">
                                                            {transaction
                                                                .category
                                                                ?.name ||
                                                                (isIncome
                                                                    ? "Income"
                                                                    : "Expense")}{" "}
                                                            ·{" "}
                                                            {formatDate(
                                                                transaction.date
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <p
                                                    className={`ml-4 shrink-0 font-semibold ${isIncome
                                                        ? "text-[#FF8315]"
                                                        : "text-[#FF3B0A]"
                                                        }`}
                                                >
                                                    {isIncome
                                                        ? "+"
                                                        : "-"}
                                                    {formatCurrency(
                                                        transaction.amount
                                                    )}
                                                </p>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}