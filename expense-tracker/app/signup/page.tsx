// "use client";

// import Link from "next/link";
// import { useState } from "react";

// export default function SignupPage() {
//     const [name, setName] = useState("");
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [confirmPassword, setConfirmPassword] = useState("");

//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);

//     async function handleSignup(
//         event: React.FormEvent<HTMLFormElement>
//     ) {
//         event.preventDefault();

//         setError("");

//         if (password !== confirmPassword) {
//             setError("Passwords do not match.");
//             return;
//         }

//         if (password.length < 8) {
//             setError("Password must be at least 8 characters.");
//             return;
//         }

//         try {
//             setLoading(true);

//             const response = await fetch("/api/auth/register", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     name,
//                     email,
//                     password,
//                 }),
//             });

//             const result = await response.json();

//             if (!response.ok) {
//                 setError(
//                     result.message || "Failed to create account."
//                 );
//                 return;
//             }

//             alert("Account created successfully!");

//             window.location.href = "/login";
//         } catch (error) {
//             console.error("Signup error:", error);

//             setError(
//                 "Something went wrong. Please try again."
//             );
//         } finally {
//             setLoading(false);
//         }
//     }

//     return (
//         <main className="flex min-h-screen items-center justify-center bg-[#F8F7F2] px-4 py-8">
//             <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
//                 <div className="mb-8">
//                     <h1 className="text-3xl font-bold text-black">
//                         Create Account
//                     </h1>

//                     <p className="mt-2 text-sm text-gray-500">
//                         Create your Pocket Tracker account
//                     </p>
//                 </div>

//                 <form onSubmit={handleSignup} className="space-y-5">
//                     <div>
//                         <label
//                             htmlFor="name"
//                             className="mb-2 block text-sm font-medium text-black"
//                         >
//                             Name
//                         </label>

//                         <input
//                             id="name"
//                             type="text"
//                             value={name}
//                             onChange={(event) =>
//                                 setName(event.target.value)
//                             }
//                             placeholder="Enter your name"
//                             required
//                             className="w-full rounded-xl border border-[#D8D4C9] bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#FF8315] focus:ring-2 focus:ring-[#FF8315]/10"
//                         />
//                     </div>

//                     <div>
//                         <label
//                             htmlFor="email"
//                             className="mb-2 block text-sm font-medium text-black"
//                         >
//                             Email
//                         </label>

//                         <input
//                             id="email"
//                             type="email"
//                             value={email}
//                             onChange={(event) =>
//                                 setEmail(event.target.value)
//                             }
//                             placeholder="Enter your email"
//                             required
//                             className="w-full rounded-xl border border-[#D8D4C9] bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#FF8315] focus:ring-2 focus:ring-[#FF8315]/10"
//                         />
//                     </div>

//                     <div>
//                         <label
//                             htmlFor="password"
//                             className="mb-2 block text-sm font-medium text-black"
//                         >
//                             Password
//                         </label>

//                         <input
//                             id="password"
//                             type="password"
//                             value={password}
//                             onChange={(event) =>
//                                 setPassword(event.target.value)
//                             }
//                             placeholder="Enter your password"
//                             required
//                             className="w-full rounded-xl border border-[#D8D4C9] bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#FF8315] focus:ring-2 focus:ring-[#FF8315]/10"
//                         />
//                     </div>

//                     <div>
//                         <label
//                             htmlFor="confirm-password"
//                             className="mb-2 block text-sm font-medium text-black"
//                         >
//                             Confirm Password
//                         </label>

//                         <input
//                             id="confirm-password"
//                             type="password"
//                             value={confirmPassword}
//                             onChange={(event) =>
//                                 setConfirmPassword(event.target.value)
//                             }
//                             placeholder="Confirm your password"
//                             required
//                             className="w-full rounded-xl border border-[#D8D4C9] bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#FF8315] focus:ring-2 focus:ring-[#FF8315]/10"
//                         />
//                     </div>

//                     {error && (
//                         <p className="text-sm text-red-500">
//                             {error}
//                         </p>
//                     )}

//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="w-full rounded-xl bg-[#FF8315] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#e66f08] disabled:cursor-not-allowed disabled:opacity-60"
//                     >
//                         {loading ? "Creating Account..." : "Create Account"}
//                     </button>
//                 </form>

//                 <p className="mt-6 text-center text-sm text-gray-500">
//                     Already have an account?{" "}
//                     <Link
//                         href="/login"
//                         className="font-medium text-[#FF8315] hover:underline"
//                     >
//                         Login
//                     </Link>
//                 </p>
//             </div>
//         </main>
//     );
// }

"use client";

import Link from "next/link";
import { Eye, EyeOff, Wallet, ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSignup(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                setError(
                    result.message ||
                        "Failed to create account."
                );
                return;
            }

            window.location.href = "/login";
        } catch (error) {
            console.error("Signup error:", error);

            setError(
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#F8F7F2]">
            <div className="grid min-h-screen lg:grid-cols-2">
                {/* Left Side */}
                <section className="hidden bg-black lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-3"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FF8315] text-white">
                            <Wallet className="h-5 w-5" />
                        </div>

                        <span className="text-xl font-bold text-white">
                            Pocket{" "}
                            <span className="text-[#FF8315]">
                                Tracker
                            </span>
                        </span>
                    </Link>

                    {/* Content */}
                    <div className="max-w-lg">
                        <p className="text-sm font-medium text-[#FF8315]">
                            YOUR MONEY, ORGANIZED
                        </p>

                        <h1 className="mt-4 text-4xl font-bold leading-tight text-white xl:text-5xl">
                            Start building better money habits.
                        </h1>

                        <p className="mt-5 max-w-md text-base leading-7 text-gray-400">
                            Track your income, expenses and
                            savings with a simple personal
                            finance dashboard.
                        </p>

                        <div className="mt-8 space-y-4">
                            {[
                                "Track income and expenses",
                                "Organize spending by category",
                                "Understand your monthly savings",
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-3"
                                >
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF8315]/15">
                                        <div className="h-2 w-2 rounded-full bg-[#FF8315]" />
                                    </div>

                                    <span className="text-sm text-gray-300">
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="text-sm text-gray-500">
                        Simple. Organized. Personal.
                    </p>
                </section>

                {/* Right Side */}
                <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
                    <div className="w-full max-w-md">
                        {/* Mobile Logo */}
                        <div className="mb-8 lg:hidden">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-3"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF8315] text-white">
                                    <Wallet className="h-5 w-5" />
                                </div>

                                <span className="text-xl font-bold">
                                    Pocket{" "}
                                    <span className="text-[#FF8315]">
                                        Tracker
                                    </span>
                                </span>
                            </Link>
                        </div>

                        {/* Back */}
                        <Link
                            href="/"
                            className="mb-8 inline-flex items-center gap-2 text-sm text-[#6F6B63] transition hover:text-black"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to home
                        </Link>

                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-black">
                                Create your account
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-[#6F6B63]">
                                Start tracking your finances in
                                a few seconds.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSignup}
                            className="mt-8 space-y-5"
                        >
                            {/* Name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm font-medium text-black"
                                >
                                    Full name
                                </label>

                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(event) =>
                                        setName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter your name"
                                    required
                                    className="w-full rounded-xl border border-[#D8D4C9] bg-white px-4 py-3.5 text-sm text-black outline-none transition placeholder:text-[#A29D92] focus:border-[#FF8315] focus:ring-4 focus:ring-[#FF8315]/10"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-black"
                                >
                                    Email address
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                    }
                                    placeholder="you@example.com"
                                    required
                                    className="w-full rounded-xl border border-[#D8D4C9] bg-white px-4 py-3.5 text-sm text-black outline-none transition placeholder:text-[#A29D92] focus:border-[#FF8315] focus:ring-4 focus:ring-[#FF8315]/10"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-medium text-black"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(
                                                event.target.value
                                            )
                                        }
                                        placeholder="At least 8 characters"
                                        required
                                        className="w-full rounded-xl border border-[#D8D4C9] bg-white px-4 py-3.5 pr-12 text-sm text-black outline-none transition placeholder:text-[#A29D92] focus:border-[#FF8315] focus:ring-4 focus:ring-[#FF8315]/10"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#8A857B] hover:bg-[#F8F7F2] hover:text-black"
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label
                                    htmlFor="confirm-password"
                                    className="mb-2 block text-sm font-medium text-black"
                                >
                                    Confirm password
                                </label>

                                <div className="relative">
                                    <input
                                        id="confirm-password"
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={confirmPassword}
                                        onChange={(event) =>
                                            setConfirmPassword(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Re-enter your password"
                                        required
                                        className="w-full rounded-xl border border-[#D8D4C9] bg-white px-4 py-3.5 pr-12 text-sm text-black outline-none transition placeholder:text-[#A29D92] focus:border-[#FF8315] focus:ring-4 focus:ring-[#FF8315]/10"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#8A857B] hover:bg-[#F8F7F2] hover:text-black"
                                        aria-label={
                                            showConfirmPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                    <p className="text-sm text-red-600">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-[#FF8315] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#e66f08] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? "Creating account..."
                                    : "Create account"}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-[#6F6B63]">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-semibold text-[#FF8315] hover:underline"
                            >
                                Log in
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}