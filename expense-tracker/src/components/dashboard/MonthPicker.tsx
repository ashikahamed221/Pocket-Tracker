"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

type MonthPickerProps = {
    value: string; // YYYY-MM
    onChange: (value: string) => void;
};

const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export default function MonthPicker({
    value,
    onChange,
}: MonthPickerProps) {
    const [open, setOpen] = useState(false);
    const [year, setYear] = useState(
        Number(value.split("-")[0])
    );

    const containerRef = useRef<HTMLDivElement>(null);

    const selectedYear = Number(value.split("-")[0]);
    const selectedMonth = Number(value.split("-")[1]) - 1;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(
                    event.target as Node
                )
            ) {
                setOpen(false);
            }
        }

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    useEffect(() => {
        setYear(selectedYear);
    }, [selectedYear]);

    function selectMonth(monthIndex: number) {
        const month = String(monthIndex + 1).padStart(2, "0");

        onChange(`${year}-${month}`);
        setOpen(false);
    }

    function goToPreviousYear() {
        setYear((current) => current - 1);
    }

    function goToNextYear() {
        setYear((current) => current + 1);
    }

    function goToCurrentMonth() {
        const now = new Date();

        const currentYear = now.getFullYear();
        const currentMonth = String(
            now.getMonth() + 1
        ).padStart(2, "0");

        setYear(currentYear);
        onChange(`${currentYear}-${currentMonth}`);
        setOpen(false);
    }

    const displayMonth = new Date(
        selectedYear,
        selectedMonth,
        1
    ).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    return (
        <div
            ref={containerRef}
            className="relative"
        >
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="flex items-center gap-3 rounded-xl border border-[#D8D4C9] bg-white px-4 py-2.5 text-sm font-medium text-black shadow-sm transition hover:border-[#FF8315] focus:outline-none focus:ring-2 focus:ring-[#FF8315]/20"
            >
                <span>{displayMonth}</span>

                <CalendarDays className="h-4 w-4 text-[#6F6B63]" />
            </button>

            {/* Picker */}
            {open && (
                <div className="absolute right-0 top-full z-50 mt-2 w-[300px] rounded-2xl border border-[#DDD9CF] bg-white p-4 shadow-xl">
                    {/* Header */}
                    <div className="mb-4 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={goToPreviousYear}
                            className="rounded-lg p-2 text-[#6F6B63] transition hover:bg-[#F8F7F2] hover:text-black"
                            aria-label="Previous year"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        <p className="text-base font-semibold text-black">
                            {year}
                        </p>

                        <button
                            type="button"
                            onClick={goToNextYear}
                            className="rounded-lg p-2 text-[#6F6B63] transition hover:bg-[#F8F7F2] hover:text-black"
                            aria-label="Next year"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Months */}
                    <div className="grid grid-cols-3 gap-2">
                        {months.map((month, index) => {
                            const isSelected =
                                year === selectedYear &&
                                index === selectedMonth;

                            return (
                                <button
                                    key={month}
                                    type="button"
                                    onClick={() =>
                                        selectMonth(index)
                                    }
                                    className={`rounded-xl px-2 py-2.5 text-sm font-medium transition ${
                                        isSelected
                                            ? "bg-[#FF8315] text-white shadow-sm"
                                            : "text-[#6F6B63] hover:bg-[#F8F7F2] hover:text-black"
                                    }`}
                                >
                                    {month.slice(0, 3)}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 border-t border-[#EEEAE1] pt-3">
                        <button
                            type="button"
                            onClick={goToCurrentMonth}
                            className="w-full rounded-xl bg-[#F8F7F2] px-3 py-2.5 text-sm font-medium text-[#FF8315] transition hover:bg-[#FFF0E3]"
                        >
                            This month
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}