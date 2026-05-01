import { Clock, DollarSign } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  price: number | null;
  isNegotiable: boolean;
  deliveryTime: string;
}

export default function ServiceCard({
  title,
  description,
  price,
  isNegotiable,
  deliveryTime,
}: ServiceCardProps) {
  return (
    <div className="bg-white dark:bg-[#151B2B] rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none hover:-translate-y-1.5 transition-all duration-300 cursor-pointer relative overflow-hidden group flex flex-col h-full">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 p-16 bg-primary-50 dark:bg-primary-500/5 rounded-full blur-[50px] group-hover:bg-primary-100 dark:group-hover:bg-primary-500/10 transition-colors pointer-events-none" />
      
      <div className="relative z-10 flex flex-col h-full">
        <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6 flex-1 text-sm leading-relaxed">
          {description}
        </p>
        
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {deliveryTime}
          </div>
        </div>

        <div className="flex items-end justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Investment
            </p>
            {isNegotiable ? (
              <p className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-1">
                Flexible
              </p>
            ) : (
              <p className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <DollarSign className="w-5 h-5 text-slate-400 -mr-1" />
                {price?.toLocaleString()}
              </p>
            )}
          </div>
          
          <button className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-full text-sm font-semibold group-hover:shadow-md transition-all">
            Start Conversation
          </button>
        </div>
      </div>
    </div>
  );
}
