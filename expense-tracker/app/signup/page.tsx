"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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

            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(
                    result.message || "Failed to create account."
                );
                return;
            }

            alert("Account created successfully!");

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
        <main className="flex min-h-screen items-center justify-center bg-[#F8F7F2] px-4 py-8">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-black">
                        Create Account
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Create your Pocket Tracker account
                    </p>
                </div>

                <form onSubmit={handleSignup} className="space-y-5">
                    <div>
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-medium text-black"
                        >
                            Name
                        </label>

                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            placeholder="Enter your name"
                            required
                            className="w-full rounded-xl border border-[#D8D4C9] bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#FF8315] focus:ring-2 focus:ring-[#FF8315]/10"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-black"
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="Enter your email"
                            required
                            className="w-full rounded-xl border border-[#D8D4C9] bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#FF8315] focus:ring-2 focus:ring-[#FF8315]/10"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium text-black"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Enter your password"
                            required
                            className="w-full rounded-xl border border-[#D8D4C9] bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#FF8315] focus:ring-2 focus:ring-[#FF8315]/10"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="confirm-password"
                            className="mb-2 block text-sm font-medium text-black"
                        >
                            Confirm Password
                        </label>

                        <input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(event.target.value)
                            }
                            placeholder="Confirm your password"
                            required
                            className="w-full rounded-xl border border-[#D8D4C9] bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#FF8315] focus:ring-2 focus:ring-[#FF8315]/10"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-[#FF8315] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#e66f08] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-medium text-[#FF8315] hover:underline"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </main>
    );
}