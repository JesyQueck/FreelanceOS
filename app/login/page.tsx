"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { loginAction } from "./actions";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const initialState = {
  message: "",
  success: false,
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const router = useRouter();

  // HARD REDIRECT: If the server action succeeded but navigation is stuck.
  useEffect(() => {
    if (state?.success) {
      window.location.href = "/dashboard";
    }
  }, [state?.success]);

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-4 font-sans antialiased selection:bg-indigo-500/30">
      <div className="w-full max-w-md">
        {/* Unified Branding Logo */}
        <div className="flex flex-col items-center mb-10 group animate-in fade-in zoom-in duration-700">
           <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                <span className="text-white font-black text-2xl italic drop-shadow-md">F.</span>
              </div>
              <span className="text-white font-black text-2xl tracking-tighter group-hover:text-indigo-400 transition-colors duration-500">Freelance<span className="text-indigo-500">OS</span></span>
           </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Continue your professional journey</p>
        </div>

        <div className="bg-[#151B2B] p-10 rounded-[2.5rem] border border-slate-800/60 shadow-[0_30px_70px_rgba(0,0,0,0.7)] relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/5 blur-[80px] rounded-full" />
          
          <form action={formAction} className="space-y-6 relative z-10">
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2.5 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    placeholder="alex@freelance.os"
                    required
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-500/50 hover:border-slate-700 transition-all text-sm"
                  />
                </div>
                {state?.errors?.email && (
                   <p className="mt-2 text-xs text-red-500/80 ml-1 font-medium italic">{state.errors.email[0]}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2.5 ml-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Password</label>
                  <Link href="#" className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 transition-colors uppercase tracking-widest">Reset?</Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-500/50 hover:border-slate-700 transition-all text-sm"
                  />
                </div>
                {state?.errors?.password && (
                   <p className="mt-2 text-xs text-red-500/80 ml-1 font-medium italic">{state.errors.password[0]}</p>
                )}
              </div>
            </div>

            {state?.message && !state.success && (
              <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl animate-in shake duration-300">
                <p className="text-xs text-red-500 font-semibold text-center">{state.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-[0_10px_25px_rgba(79,70,229,0.3)] hover:bg-white hover:text-black hover:shadow-[0_15px_30px_rgba(255,255,255,0.1)] transition-all duration-500 disabled:opacity-50 flex items-center justify-center group text-xs uppercase tracking-[0.2em]"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Enter Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-10 text-slate-600 text-xs font-medium">
            Not a member? {" "}
            <Link href="/signup" className="text-slate-300 font-bold hover:text-indigo-400 transition-colors underline-offset-4 hover:underline">
              Request Access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
