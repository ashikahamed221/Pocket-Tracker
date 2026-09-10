"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    LayoutDashboard,
    ArrowDownToLine,
    ArrowUpToLine,
    History,
    BarChart3,
    Settings,
    Wallet,
    Moon,
} from "lucide-react";

const navigation = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "Income",
        href: "/income",
        icon: ArrowDownToLine,
    },
    {
        name: "Expense",
        href: "/expense",
        icon: ArrowUpToLine,
    },
    {
        name: "History",
        href: "/history",
        icon: History,
    },
    {
        name: "Reports",
        href: "/reports",
        icon: BarChart3,
    },
    {
        name: "Settings",
        href: "/settings",
        icon: Settings,
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <>
            {/* =========================
                Desktop Sidebar
            ========================== */}
            <aside className="hidden min-h-screen w-64 shrink-0 bg-black lg:block">
                <div className="flex h-full min-h-screen flex-col px-4 py-6">

                    {/* Logo */}
                    <div className="mb-10 flex items-center gap-3 px-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF8315] text-white">
                            <Wallet className="h-5 w-5" />
                        </div>

                        <span className="text-xl font-semibold text-white">
                            Pocket{" "}
                            <span className="text-[#FF8315]">
                                Tracker
                            </span>
                        </span>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;

                            const isActive =
                                pathname === item.href;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-4 rounded-full px-4 py-3 text-sm font-medium transition ${
                                        isActive
                                            ? "bg-[#FF8315] text-white"
                                            : "text-gray-300 hover:bg-white/10 hover:text-white"
                                    }`}
                                >
                                    <Icon className="h-5 w-5" />

                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom */}
                    <div className="mt-auto">
                        <button
                            type="button"
                            className="flex w-full items-center gap-4 rounded-full px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
                        >
                            <Moon className="h-5 w-5" />

                            <span>Dark mode</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* =========================
                Mobile Bottom Navigation
            ========================== */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#DDD9CF] bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_15px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden">
                <div className="mx-auto flex max-w-md items-stretch justify-between">
                    {navigation.map((item) => {
                        const Icon = item.icon;

                        const isActive =
                            pathname === item.href;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition ${
                                    isActive
                                        ? "text-[#FF8315]"
                                        : "text-[#6F6B63]"
                                }`}
                            >
                                <Icon
                                    className={`h-5 w-5 ${
                                        isActive
                                            ? "stroke-[2.5]"
                                            : "stroke-[1.8]"
                                    }`}
                                />

                                <span className="truncate">
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}