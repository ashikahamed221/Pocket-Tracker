// "use client";

// import { signIn } from "next-auth/react";
// import { useState } from "react";
// import { useRouter } from "next/navigation";

// export default function LoginPage() {
//     const router = useRouter();

//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);

//     async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
//         event.preventDefault();

//         try {
//             setLoading(true);
//             setError("");

//             const result = await signIn("credentials", {
//                 email,
//                 password,
//                 redirect: false,
//             });

//             if (!result || result.error) {
//                 setError("Invalid email or password.");
//                 return;
//             }

//             router.push("/dashboard");
//             router.refresh();
//         } catch (error) {
//             console.error("Login error:", error);
//             setError("Something went wrong. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     }

//     return (
//         <main className="flex min-h-screen items-center justify-center bg-[#F8F7F2] px-4">
//             <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
//                 <div className="mb-8">
//                     <h1 className="text-3xl font-bold text-black">
//                         Welcome Back
//                     </h1>

//                     <p className="mt-2 text-sm text-gray-500">
//                         Login to your Pocket Tracker account
//                     </p>
//                 </div>

//                 <form onSubmit={handleLogin} className="space-y-5">
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
//                         {loading ? "Logging in..." : "Login"}
//                     </button>
//                 </form>

//                 <p className="mt-6 text-center text-sm text-gray-500">
//                     Don't have an account?{" "}
//                     <a
//                         href="/signup"
//                         className="font-medium text-[#FF8315] hover:underline"
//                     >
//                         Create Account
//                     </a>
//                 </p>
//             </div>
//         </main>
//     );
// }

"use client";

import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Wallet } from "lucide-react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");

        try {
            setLoading(true);

            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (!result || result.error) {
                setError("Invalid email or password.");
                return;
            }

            router.push("/dashboard");
            router.refresh();
        } catch (error) {
            console.error("Login error:", error);

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
                            WELCOME BACK
                        </p>

                        <h1 className="mt-4 text-4xl font-bold leading-tight text-white xl:text-5xl">
                            Your finances,
                            <br />
                            all in one place.
                        </h1>

                        <p className="mt-5 max-w-md text-base leading-7 text-gray-400">
                            Keep track of your income, expenses,
                            savings, and financial activity from
                            one simple dashboard.
                        </p>

                        <div className="mt-8 space-y-4">
                            {[
                                "See your financial overview",
                                "Track spending by category",
                                "Generate detailed reports",
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

                        {/* Heading */}
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-black">
                                Welcome back
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-[#6F6B63]">
                                Log in to continue managing your
                                finances.
                            </p>
                        </div>

                        {/* Form */}
                        <form
                            onSubmit={handleLogin}
                            className="mt-8 space-y-5"
                        >
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
                                        placeholder="Enter your password"
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
                                    ? "Logging in..."
                                    : "Log in"}
                            </button>
                        </form>

                        {/* Signup */}
                        <p className="mt-6 text-center text-sm text-[#6F6B63]">
                            Don't have an account?{" "}
                            <Link
                                href="/signup"
                                className="font-semibold text-[#FF8315] hover:underline"
                            >
                                Create account
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}