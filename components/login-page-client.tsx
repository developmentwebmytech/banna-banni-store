"use client";

import { LoginForm } from "@/components/login-form";

export default function LoginPageClient() {
  return (
    <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div
          className=" absolute inset-27 bg-cover"
          style={{ backgroundImage: "url('/login-banner.webp')" }}
        />
      
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <footer className="text-sm">Admin Dashboard</footer>
          </blockquote>
        </div>
      </div>

      <div className="p-4 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Login to your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and password to login to your account
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
