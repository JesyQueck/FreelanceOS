import Link from "next/link";
import { Plus, LayoutGrid } from "lucide-react";
import ServiceCard from "@/components/ServiceCard";

export default function ServicesDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Services</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage your offerings and pricing packages.
          </p>
        </div>
        <Link href="/dashboard/services/new" className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-full font-medium shadow-sm hover:bg-primary-700 transition-colors">
          <Plus className="h-4 w-4" />
          Create Service
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ServiceCard
          title="Web App Redesign"
          description="A full top-to-bottom UI/UX overhaul of your existing SaaS product to modernize the feel and improve usability."
          price={4500}
          isNegotiable={false}
          deliveryTime="2-3 weeks"
        />
        <ServiceCard
          title="Startup Pitch Deck"
          description="Stunning, high-converting presentation design for your Seed or Series A fundraising round."
          price={null}
          isNegotiable={true}
          deliveryTime="1 week"
        />
        
        {/* Add New Placeholder */}
        <Link href="/dashboard/services/new" className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
          <div className="h-14 w-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <LayoutGrid className="h-6 w-6 text-slate-500" />
          </div>
          <p className="font-medium text-slate-600 dark:text-slate-400">Add a New Service</p>
        </Link>
      </div>
    </div>
  );
}
