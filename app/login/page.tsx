"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/account/profile");
    }
  }, [status, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/account/profile");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="bg-white rounded shadow-md flex max-w-4xl w-full overflow-hidden">
        {/* Left image */}
        <div className="hidden md:block w-1/2 relative h-[550px]">
          <Image
            src="/login-banner.webp"
            alt="Login"
            fill
            className="object-cover h-[250px]"
          />
        </div>

        {/* Right form */}
        <div className="w-full md:w-1/2 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Login</h1>
          <p className="text-gray-600 mb-6">Welcome to Banna Banni</p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
                required
                disabled={loading}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 text-teal-600 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-teal-700 text-white font-medium py-2 rounded hover:bg-teal-800 ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Logging in..." : "LOG IN"}
            </button>
          </form>

          <div className="mt-4 space-y-2">
            <Link href="/forgot-password" className="text-sm text-teal-700 hover:underline block">
              Forgot your password?
            </Link>
            <Link href="/register" className="text-sm text-teal-700 hover:underline block">
              Create Your Account?
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
