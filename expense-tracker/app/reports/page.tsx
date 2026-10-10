"use client";

import {
    ArrowDownLeft,
    ArrowUpRight,
    FileSpreadsheet,
    PiggyBank,
} from "lucide-react";
import { useEffect, useState } from "react";


import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import DashboardLayout from "@/src/components/dashboard/DashboardLayout";

import * as XLSX from "xlsx";


const CHART_COLORS = [
    "#000000",
    "#FF8315",
    "#FF3B0A",
    "#E5A900",
    "#E36152"
];



type ReportData = {
    summary: {
        income: number;
        expenses: number;
        savings: number;
    };

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

export default function ReportsPage() {
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();

        return `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(2, "0")}`;
    });
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [reportMode, setReportMode] = useState<"monthly" | "custom">(
        "monthly"
    );



    const [reportData, setReportData] =
        useState<ReportData | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // fetch the reports

    async function fetchReportData() {
        try {
            setLoading(true);
            setError("");

            let reportUrl = `/api/dashboard?month=${selectedMonth}`;

            if (reportMode === "custom") {
                reportUrl = `/api/dashboard?from=${fromDate}&to=${toDate}`;
            }

            const response = await fetch(reportUrl);

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to load report"
                );
            }

            setReportData(result);
        } catch (error) {
            console.error("Fetch report error:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load report"
            );
        } finally {
            setLoading(false);
        }
    }

    async function generateCustomReport() {
        if (!fromDate || !toDate) {
            setError("Please select both dates.");
            return;
        }

        if (fromDate > toDate) {
            setError("From date cannot be after To date.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `/api/dashboard?from=${fromDate}&to=${toDate}`
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to load custom report"
                );
            }

            setReportData(result);
            setReportMode("custom");
        } catch (error) {
            console.error("Custom report error:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load custom report"
            );
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        if (reportMode === "monthly") {
            fetchReportData();
            return;
        }

        if (reportMode === "custom" && fromDate && toDate) {
            fetchReportData();
        }
    }, [selectedMonth, reportMode]);




    const totalExpenses =
        reportData?.expensesByCategory?.reduce(
            (total, category) =>
                total + Number(category.amount),
            0
        ) ?? 0;



    function downloadExcel() {
        if (!reportData) {
            return;
        }

        const summaryData = [
            {
                Metric: "Income",
                Amount: reportData.summary.income,
            },
            {
                Metric: "Expenses",
                Amount: reportData.summary.expenses,
            },
            {
                Metric: "Savings",
                Amount: reportData.summary.savings,
            },
        ];

        const categoryData = reportData.expensesByCategory.map(
            (category) => ({
                Category: category.categoryName,
                Amount: Number(category.amount),
            })
        );

        const dailyData = reportData.dailySummary.map(
            (day) => ({
                Date: day.date,
                Income: Number(day.income),
                Expenses: Number(day.expenses),
                Savings: Number(day.savings),
            })
        );

        const workbook = XLSX.utils.book_new();

        const summarySheet =
            XLSX.utils.json_to_sheet(summaryData);

        const categorySheet =
            XLSX.utils.json_to_sheet(categoryData);

        const dailySheet =
            XLSX.utils.json_to_sheet(dailyData);

        XLSX.utils.book_append_sheet(
            workbook,
            summarySheet,
            "Summary"
        );

        XLSX.utils.book_append_sheet(
            workbook,
            categorySheet,
            "Expenses by Category"
        );

        XLSX.utils.book_append_sheet(
            workbook,
            dailySheet,
            "Daily Summary"
        );

        const fileName =
            reportMode === "custom"
                ? `expense-report-${fromDate}-to-${toDate}.xlsx`
                : `expense-report-${selectedMonth}.xlsx`;

        XLSX.writeFile(workbook, fileName);
    }

    return (
        <DashboardLayout>
            <main className="min-h-screen bg-[#F8F7F2] p-5 pb-24 md:p-8 lg:pb-8">
                <div className="mx-auto max-w-6xl">

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-semibold tracking-tight text-black md:text-4xl">
                            Reports
                        </h1>

                        <p className="mt-2 text-sm text-[#6F6B63]">
                            Track your financial activity and get insights.
                        </p>
                    </div>

                    {/* Report Controls */}
                    <div className="rounded-3xl border border-[#DDD9CF] bg-white p-6 shadow-sm md:p-7">

                        {/* Date Range + Month */}
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

                            <div>
                                <p className="text-sm font-medium text-[#6F6B63]">
                                    Date Range
                                </p>

                                <p className="mt-1 text-base font-medium text-black">
                                    {reportMode === "custom" && fromDate && toDate
                                        ? `${fromDate} → ${toDate}`
                                        : `${selectedMonth}-01 → ${selectedMonth}-${new Date(
                                            Number(selectedMonth.split("-")[0]),
                                            Number(selectedMonth.split("-")[1]),
                                            0
                                        ).getDate()}`}
                                </p>
                            </div>

                            <div className="w-full lg:max-w-xs">
                                <label
                                    htmlFor="report-month"
                                    className="mb-2 block text-sm font-medium text-[#6F6B63]"
                                >
                                    Select Month
                                </label>

                                <input
                                    id="report-month"
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(event) =>
                                        setSelectedMonth(
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-[#D8D4C9] bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#FF8315] focus:ring-2 focus:ring-[#FF8315]/10"
                                />

                                
                            </div>
                        </div>


                        {/* Custom Date Range */}
                        <div className="mt-6 border-t border-[#DDD9CF] pt-6">
                            <p className="text-sm font-medium text-[#6F6B63]">
                                Custom Date Range
                            </p>

                            <div className="mt-3 grid gap-4 md:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="from-date"
                                        className="mb-2 block text-sm font-medium text-[#6F6B63]"
                                    >
                                        From
                                    </label>

                                    <input
                                        id="from-date"
                                        type="date"
                                        value={fromDate}
                                        onChange={(event) =>
                                            setFromDate(event.target.value)
                                        }
                                        className="w-full rounded-xl border border-[#D8D4C9] bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#FF8315] focus:ring-2 focus:ring-[#FF8315]/10"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="to-date"
                                        className="mb-2 block text-sm font-medium text-[#6F6B63]"
                                    >
                                        To
                                    </label>

                                    <input
                                        id="to-date"
                                        type="date"
                                        value={toDate}
                                        min={fromDate}
                                        onChange={(event) =>
                                            setToDate(event.target.value)
                                        }
                                        className="w-full rounded-xl border border-[#D8D4C9] bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#FF8315] focus:ring-2 focus:ring-[#FF8315]/10"
                                    />
                                </div>



                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={generateCustomReport}
                                        className="rounded-xl bg-[#FF8315] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#e66f08]"
                                    >
                                        Generate Report
                                    </button>
                                </div>
                            </div>
                        </div>


                        {/* Download Buttons */}
                        <div className="mt-5 flex flex-wrap gap-3">                          

                            <button
                                type="button"
                                onClick={downloadExcel}
                                className="flex items-center gap-2 rounded-xl border border-[#D8D4C9] bg-white px-4 py-2.5 text-sm font-medium text-black shadow-sm transition hover:border-[#FF8315] hover:text-[#FF8315]"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                Download Excel
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="mt-6 grid gap-4 md:grid-cols-3">

                        {/* Income */}
                        <div className="rounded-3xl border border-[#DDD9CF] bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-[#6F6B63]">
                                        INCOME
                                    </p>

                                    <p className="mt-3 text-3xl font-semibold text-black">
                                        {loading
                                            ? "..."
                                            : `₹${Number(
                                                reportData?.summary.income ?? 0
                                            ).toLocaleString("en-IN")}`}
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F6EF]">
                                    <ArrowDownLeft className="h-5 w-5 text-[#009B68]" />
                                </div>
                            </div>
                        </div>

                        {/* Expenses */}
                        <div className="rounded-3xl border border-[#DDD9CF] bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-[#6F6B63]">
                                        EXPENSES
                                    </p>

                                    <p className="mt-3 text-3xl font-semibold text-black">
                                        {loading
                                            ? "..."
                                            : `₹${Number(
                                                reportData?.summary.expenses ?? 0
                                            ).toLocaleString("en-IN")}`}
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFE9E3]">
                                    <ArrowUpRight className="h-5 w-5 text-[#FF3B0A]" />
                                </div>
                            </div>
                        </div>

                        {/* Savings */}
                        <div className="rounded-3xl border border-[#DDD9CF] bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-[#6F6B63]">
                                        REMAINING BALANCE
                                    </p>

                                    <p className="mt-3 text-3xl font-semibold text-black">
                                        {loading
                                            ? "..."
                                            : `₹${Number(
                                                reportData?.summary.savings ?? 0
                                            ).toLocaleString("en-IN")}`}
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F6EF]">
                                    <PiggyBank className="h-5 w-5 text-[#009B68]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts - Coming Next */}
                    <div className="mt-6 grid gap-5 lg:grid-cols-2">

                        <div className="rounded-3xl border border-[#DDD9CF] bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-black">
                                Spend by category
                            </h2>

                            <div className="mt-6 h-[360px]">
                                {reportData?.expensesByCategory?.length ? (
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart
                                            data={reportData.expensesByCategory}
                                            layout="vertical"
                                            margin={{
                                                top: 5,
                                                right: 20,
                                                left: 20,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                horizontal={false}
                                            />

                                            <XAxis
                                                type="number"
                                                tick={{ fontSize: 12 }}
                                                tickFormatter={(value) =>
                                                    `₹${Number(value).toLocaleString(
                                                        "en-IN"
                                                    )}`
                                                }
                                            />

                                            <YAxis
                                                type="category"
                                                dataKey="categoryName"
                                                width={80}
                                                tick={{ fontSize: 12 }}
                                            />

                                            <Tooltip
                                                formatter={(value) =>
                                                    `₹${Number(value).toLocaleString(
                                                        "en-IN"
                                                    )}`
                                                }
                                            />

                                            <Bar
                                                dataKey="amount"
                                                radius={[0, 6, 6, 0]}
                                            >
                                                {reportData.expensesByCategory.map(
                                                    (entry, index) => (
                                                        <Cell
                                                            key={entry.categoryId}
                                                            fill={
                                                                CHART_COLORS[
                                                                index % CHART_COLORS.length
                                                                ]
                                                            }
                                                        />
                                                    )
                                                )}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <p className="text-sm text-[#6F6B63]">
                                            No expense data available for this month.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-[#DDD9CF] bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-black">
                                Share of spending
                            </h2>

                            <div className="mt-6 h-[360px]">
                                {reportData?.expensesByCategory?.length ? (
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <PieChart>

                                            <Pie
                                                data={reportData.expensesByCategory}
                                                dataKey="amount"
                                                nameKey="categoryName"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={120}
                                                innerRadius={0}
                                                label={({ value }) => {
                                                    if (!totalExpenses) return "";

                                                    const percentage =
                                                        (Number(value) / totalExpenses) * 100;

                                                    return `${percentage.toFixed(1)}%`;
                                                }}
                                            >
                                                {reportData.expensesByCategory.map(
                                                    (entry, index) => (
                                                        <Cell
                                                            key={entry.categoryId}
                                                            fill={
                                                                CHART_COLORS[
                                                                index % CHART_COLORS.length
                                                                ]
                                                            }
                                                        />
                                                    )
                                                )}
                                            </Pie>

                                            <Tooltip
                                                formatter={(value) =>
                                                    `₹${Number(value).toLocaleString(
                                                        "en-IN"
                                                    )}`
                                                }
                                            />

                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <p className="text-sm text-[#6F6B63]">
                                            No expense data available for this month.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </DashboardLayout>
    );
}