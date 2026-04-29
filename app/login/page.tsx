import Link from "next/link";
import { Briefcase } from "lucide-react";
import { login, signup } from "./actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error: string };
}) {
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md pt-32 pb-12 mx-auto min-h-screen relative">
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-3 rounded-lg no-underline text-slate-300 bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:text-white transition-all flex items-center group text-xs font-medium"
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
        <div className="bg-indigo-600/20 border border-indigo-500/30 p-3 rounded-2xl mb-4 shadow-lg shadow-indigo-900/20">
          <Briefcase className="h-6 w-6 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
        <p className="text-xs text-slate-400 mt-1.5">Enter your email and password to sign in</p>
      </div>

      <form className="flex-1 flex flex-col w-full justify-center gap-4 text-foreground">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 block" htmlFor="email">
              Email
            </label>
            <input
              className="w-full rounded-xl border border-slate-700/50 px-4 py-2.5 text-sm bg-[#0F1523] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
              name="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-slate-300" htmlFor="password">
                Password
              </label>
            </div>
            <input
              className="w-full rounded-xl border border-slate-700/50 px-4 py-2.5 text-sm bg-[#0F1523] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-4 mt-6">
          <button
            formAction={login}
            className="w-full bg-indigo-600 text-white rounded-xl px-4 py-3 text-sm font-semibold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
          >
            Sign In
          </button>
          
          <div className="text-center mt-2">
            <span className="text-xs text-slate-400">Don't have an account? </span>
            <Link
              href="/signup"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Sign Up Now
            </Link>
          </div>
        </div>

        {searchParams?.error && (
          <p className="mt-4 p-4 bg-red-900/20 text-red-400 text-center text-xs rounded-lg border border-red-900/50">
            {searchParams.error}
          </p>
        )}
      </form>
    </div>
  );
}
