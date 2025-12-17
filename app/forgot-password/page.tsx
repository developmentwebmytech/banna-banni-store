"use client";

import Image from "next/image";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      {/* Laravel-like Icon */}
      <div className="mb-7">
        <Image
          src="/banna banni logo.webp" // Replace with your logo path in /public
          alt="Logo"
          width={48}
          height={48}
        />
      </div>

      {/* Card */}
      <div className="bg-white rounded shadow p-6 max-w-md w-full">
        <p className="text-gray-700 mb-4">
          Forgot your password? No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one.
        </p>
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-700 text-white font-medium py-2 rounded hover:bg-teal-800"
          >
            EMAIL PASSWORD RESET LINK
          </button>
        </form>
      </div>
    </main>
  );
}
