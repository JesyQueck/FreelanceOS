"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Sparkles, DollarSign, Clock, Info } from "lucide-react";

export default function CreateServicePage() {
  const [isNegotiable, setIsNegotiable] = useState(false);

  return (
    <div className="max-w-3xl pb-12">
      <Link href="/dashboard/services" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Services
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Create New Service</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Define a clear package to help clients understand your value.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-full font-medium shadow-sm hover:bg-primary-700 transition-colors">
          <Save className="h-4 w-4" />
          Publish Service
        </button>
      </div>

      <div className="bg-white dark:bg-[#151B2B] rounded-3xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-sm">
        <div className="p-8 md:p-10 space-y-8">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Service Title
            </label>
            <input
              type="text"
              placeholder="e.g. Complete SaaS Web App Design"
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/80 px-5 py-3.5 bg-slate-50/50 dark:bg-[#0B0F19]/50 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium text-lg placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-medium text-slate-900 dark:text-white">
                Detailed Description
              </label>
              <span className="text-xs text-slate-400">Aim for 2-3 sentences</span>
            </div>
            <textarea
              rows={4}
              placeholder="What exactly will the client get? Describe your deliverables..."
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/80 px-5 py-3.5 bg-slate-50/50 dark:bg-[#0B0F19]/50 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none"
            />
          </div>

          <div className="w-full h-px bg-slate-100 dark:bg-slate-800/80 my-8" />

          {/* Pricing & Delivery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Price section */}
            <div className="space-y-6">
              <div>
                <label className="flex text-sm font-medium text-slate-900 dark:text-white mb-2 items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400" /> Fixed Price
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input
                    type="number"
                    disabled={isNegotiable}
                    placeholder="2500"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/80 pl-9 pr-5 py-3.5 bg-slate-50/50 dark:bg-[#0B0F19]/50 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 transition-all disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/30">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Negotiable / Custom Price</p>
                  <p className="text-xs text-slate-500 mt-0.5">Let clients discuss the budget with you.</p>
                </div>
                {/* Toggle UI */}
                <button 
                  onClick={() => setIsNegotiable(!isNegotiable)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    isNegotiable ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isNegotiable ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            {/* Delivery Time */}
            <div>
              <label className="flex text-sm font-medium text-slate-900 dark:text-white mb-2 items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" /> Delivery Time
              </label>
              <select className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/80 px-5 py-3.5 bg-slate-50/50 dark:bg-[#0B0F19]/50 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 transition-all appearance-none cursor-pointer">
                <option>Select a timeframe</option>
                <option>1-3 days</option>
                <option>1 week</option>
                <option>2-3 weeks</option>
                <option>1 month</option>
                <option>Ongoing / Monthly</option>
              </select>
              
              <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">
                  Clear delivery timelines increase booking rates by 35%. Always give yourself a small buffer for revisions!
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
