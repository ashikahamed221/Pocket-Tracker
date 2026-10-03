import Link from "next/link";
import {
    ArrowRight,
    BarChart3,
    CheckCircle2,
    Wallet,
} from "lucide-react";

const features = [
    {
        title: "Track Income",
        description:
            "Record your salary, freelance income, and other earnings in one place.",
        icon: Wallet,
    },
    {
        title: "Manage Expenses",
        description:
            "Organize your spending with simple expense categories.",
        icon: CheckCircle2,
    },
    {
        title: "Understand Your Money",
        description:
            "See your savings, spending breakdown, and reports clearly.",
        icon: BarChart3,
    },
];

export default function HomePage() {
    return (
        <main className="min-h-screen bg-[#F8F7F2] text-black">
            {/* Navbar */}
            <header className="border-b border-[#E3DFD5] bg-[#F8F7F2]/95">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-6 lg:px-8">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-3"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF8315] text-white">
                            <Wallet className="h-5 w-5" />
                        </div>

                        <span className="text-xl font-bold tracking-tight">
                            Pocket{" "}
                            <span className="text-[#FF8315]">
                                Tracker
                            </span>
                        </span>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex items-center gap-3">
                        <Link
                            href="/login"
                            className="rounded-full px-4 py-2 text-sm font-medium text-black transition hover:bg-black/5"
                        >
                            Login
                        </Link>

                        <Link
                            href="/signup"
                            className="rounded-full bg-[#FF8315] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#e66f08]"
                        >
                            Get Started
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section className="px-5 pb-20 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-28">
                <div className="mx-auto max-w-6xl">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E3DFD5] bg-white px-4 py-2 text-sm font-medium text-[#6F6B63]">
                            <span className="h-2 w-2 rounded-full bg-[#FF8315]" />
                            Simple personal finance tracking
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                            Take control of{" "}
                            <span className="text-[#FF8315]">
                                your money.
                            </span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#6F6B63] sm:text-lg">
                            Track your income, expenses, savings,
                            and spending habits in one simple
                            and organized place.
                        </p>

                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                            <Link
                                href="/signup"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF8315] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#e66f08]"
                            >
                                Start Tracking
                                <ArrowRight className="h-4 w-4" />
                            </Link>

                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center rounded-full border border-[#D8D4C9] bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-[#F3F1EA]"
                            >
                                I already have an account
                            </Link>
                        </div>
                    </div>

                    {/* Dashboard Preview */}
                    <div className="mx-auto mt-16 max-w-5xl">
                        <div className="rounded-3xl border border-[#D8D4C9] bg-white p-3 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-5">
                            <div className="rounded-2xl bg-black p-5 sm:p-7">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400">
                                            Monthly overview
                                        </p>

                                        <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                                            Your finances at a glance
                                        </h2>
                                    </div>

                                    <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-[#FF8315] text-white sm:flex">
                                        <Wallet className="h-5 w-5" />
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-2xl bg-white/10 p-4">
                                        <p className="text-xs text-gray-400">
                                            Income
                                        </p>
                                        <p className="mt-2 text-xl font-semibold text-white">
                                            ₹45,000
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-white/10 p-4">
                                        <p className="text-xs text-gray-400">
                                            Expenses
                                        </p>
                                        <p className="mt-2 text-xl font-semibold text-white">
                                            ₹18,500
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-[#FF8315] p-4">
                                        <p className="text-xs text-white/70">
                                            Savings
                                        </p>
                                        <p className="mt-2 text-xl font-semibold text-white">
                                            ₹26,500
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="border-t border-[#E3DFD5] bg-white px-5 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-sm font-semibold text-[#FF8315]">
                            Everything in one place
                        </p>

                        <h2 className="mt-2 text-3xl font-bold tracking-tight">
                            Simple tools for your daily finances
                        </h2>

                        <p className="mt-4 text-sm leading-6 text-[#6F6B63] sm:text-base">
                            Keep your financial activity organized
                            without unnecessary complexity.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-5 md:grid-cols-3">
                        {features.map((feature) => {
                            const Icon = feature.icon;

                            return (
                                <div
                                    key={feature.title}
                                    className="rounded-2xl border border-[#E3DFD5] bg-[#F8F7F2] p-6"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF0E2] text-[#FF8315]">
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    <h3 className="mt-5 text-lg font-semibold">
                                        {feature.title}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-[#6F6B63]">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-[#E3DFD5] bg-[#F8F7F2] px-5 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-[#6F6B63] sm:flex-row">
                    <p>
                        © {new Date().getFullYear()} Pocket Tracker
                    </p>

                    <p>
                        Simple. Organized. Personal.
                    </p>
                </div>
            </footer>
        </main>
    );
}