"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction } from "./actions";
import { Loader2, Mail, Lock, Briefcase, Zap } from "lucide-react";

const initialState = {
  message: "",
};

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signupAction, initialState);

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-4 font-sans antialiased selection:bg-indigo-500/30">
      <div className="w-full max-w-md">
        {/* Unified Branding Logo */}
        <div className="flex flex-col items-center mb-10 group animate-in fade-in zoom-in duration-700">
           <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                <Briefcase className="text-white h-6 w-6" />
              </div>
              <span className="text-white font-black text-2xl tracking-tighter group-hover:text-indigo-400 transition-colors duration-500">Freelance<span className="text-indigo-500">OS</span></span>
           </div>
          <h1 className="text-3xl font-bold text-white tracking-tight text-center px-4">Begin Your Tenure</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium flex items-center gap-2">
             <Zap className="h-4 w-4 text-indigo-500 animate-pulse" /> Join the professional network
          </p>
        </div>

        <div className="bg-[#151B2B] p-10 rounded-[2.5rem] border border-slate-800/60 shadow-[0_30px_70px_rgba(0,0,0,0.7)] relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
           {/* Subtle Gradient Glow */}
           <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600/5 blur-[80px] rounded-full" />

          <form action={formAction} className="space-y-6 relative z-10">
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2.5 ml-1">Work Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@company.os"
                    required
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-500/50 hover:border-slate-700 transition-all text-sm"
                  />
                </div>
                {state?.errors?.email && (
                   <p className="mt-2 text-xs text-red-500/80 ml-1 font-medium italic">{state.errors.email[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2.5 ml-1">Secure Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    name="password"
                    type="password"
                    placeholder="Min. 6 characters"
                    required
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-500/50 hover:border-slate-700 transition-all text-sm"
                  />
                </div>
                {state?.errors?.password && (
                   <p className="mt-2 text-xs text-red-500/80 ml-1 font-medium italic">{state.errors.password[0]}</p>
                )}
              </div>
            </div>

            {state?.message && (
              <div className={`p-4 border rounded-2xl animate-in fade-in duration-300 ${state.success ? 'bg-green-500/5 border-green-500/10 text-green-400' : 'bg-red-500/5 border-red-500/10 text-red-500'}`}>
                <p className="text-xs font-semibold text-center">{state.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-[0_10px_25px_rgba(79,70,229,0.3)] hover:bg-white hover:text-black hover:shadow-[0_15px_30px_rgba(255,255,255,0.1)] transition-all duration-500 disabled:opacity-50 flex items-center justify-center text-xs uppercase tracking-[0.2em] group"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Create Master Account"
              )}
            </button>
          </form>

          <div className="text-center mt-10">
            <span className="text-slate-600 text-xs font-medium">Existing user?</span>{" "}
            <Link href="/login" className="text-slate-300 font-bold hover:text-indigo-400 transition-colors text-xs underline-offset-4 hover:underline">
              Enter Platform
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
