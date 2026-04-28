import Link from "next/link";
import { Briefcase } from "lucide-react";
import { login, signup } from "./actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error: string };
}) {
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto min-h-screen">
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>{" "}
        Back
      </Link>

      <div className="flex flex-col items-center mb-8">
        <div className="bg-primary-600 p-3 rounded-2xl mb-4 shadow-lg shadow-primary-600/20">
          <Briefcase className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-slate-500 mt-2">Enter your email and password to sign in</p>
      </div>

      <form className="flex-1 flex flex-col w-full justify-center gap-4 text-foreground">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">
              Email
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              name="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">
              Password
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-3 mt-4">
          <button
            formAction={login}
            className="w-full bg-primary-600 text-white rounded-xl px-4 py-3 font-medium hover:bg-primary-700 transition-colors shadow-sm"
          >
            Sign In
          </button>
          <button
            formAction={signup}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            Sign Up
          </button>
        </div>

        {searchParams?.error && (
          <p className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-center text-sm rounded-xl border border-red-100 dark:border-red-900/50">
            {searchParams.error}
          </p>
        )}
      </form>
    </div>
  );
}
