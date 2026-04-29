import Link from "next/link";
import { MessageSquare, Share2, CheckCircle2, Zap, ArrowRight, Clock, DollarSign, ExternalLink } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { initiateDealRoom } from "./actions";
import { notFound } from "next/navigation";

export default async function FreelancerPublicProfile(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  
  // NOTE: In production, `params.id` would be the UUID or a custom string slug.
  // We mock a resilient fallback so the beautiful visual design renders even on fresh databases.
  
  let profile = {
    id: params.id,
    name: "Alex Rivera",
    bio: "Award-winning digital designer specializing in SaaS UI/UX. I help early-stage startups look like enterprise giants.",
    skills: ['UI/UX Design', 'Figma', 'SaaS', 'Webflow', 'Branding'],
  };
  
  let portfolios = [
    { id: 1, title: "Fintech Dashboard Platform", description: "Complete UI kit and user experience overhaul.", image: "bg-gradient-to-br from-indigo-500/20 to-purple-600/40" },
    { id: 2, title: "HealthTech CRM App", description: "Clean, accessible interface for medical professionals.", image: "bg-gradient-to-br from-blue-500/20 to-cyan-600/40" }
  ];

  let services = [
    { id: 1, title: "Web App Redesign", description: "A full top-to-bottom UI/UX overhaul of your existing SaaS product to modernize the feel.", price: 4500, isNegotiable: false, deliveryTime: "2-3 weeks" },
    { id: 2, title: "Landing Page Focus", description: "High-converting marketing landing page design built to increase your signup rates.", price: 1800, isNegotiable: true, deliveryTime: "1 week" }
  ];

  // Try fetching actual data from Supabase
  const { data: dbProfile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (dbProfile) {
    profile = { ...profile, ...dbProfile };
    
    // Fetch related tables
    const { data: dbPortfolios } = await supabase.from("portfolios").select("*").eq("user_id", profile.id);
    if (dbPortfolios && dbPortfolios.length > 0) portfolios = dbPortfolios;

    const { data: dbServices } = await supabase.from("services").select("*").eq("user_id", profile.id);
    if (dbServices && dbServices.length > 0) services = dbServices;
  }

  // Extract initials for Avatar
  const initials = profile.name?.substring(0, 2).toUpperCase() || "FR";

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-50 selection:bg-indigo-500/30 font-sans">
      
      {/* PUBLIC NAVBAR */}
      <nav className="w-full bg-[#0B0F19]/80 backdrop-blur-xl border-b border-slate-800/80 h-[72px] flex items-center px-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto w-full flex justify-between items-center">
          <Link href="/" className="font-bold tracking-tight text-lg text-slate-900 dark:text-white">FreelanceOS</Link>
          <div className="flex gap-5 items-center">
            <button className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
              <Share2 className="h-4 w-4" /> Share Profile
            </button>
            <span className="w-px h-5 bg-slate-200 dark:bg-slate-800" />
            <Link href="/login" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors">
              Client Login
            </Link>
          </div>
        </div>
      </nav>

      {/* HEADER SECTION (Identity & Intro) */}
      <header className="w-full bg-white dark:bg-[#0B0F19] pt-24 pb-20 relative overflow-hidden">
        {/* Decorative Background Glows */}
        <div className="absolute top-0 right-[20%] w-[500px] h-[500px] bg-primary-600/10 dark:bg-primary-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-[-10%] w-[400px] h-[400px] bg-purple-600/10 dark:bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-14 text-center md:text-left">
          {/* Avatar Area */}
          <div className="flex-shrink-0">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/30 p-1 flex items-center justify-center transform transition-transform hover:scale-[1.02] duration-500">
              <div className="w-full h-full bg-[#151B2B] rounded-[2.3rem] overflow-hidden flex items-center justify-center text-5xl md:text-6xl text-white font-bold tracking-tighter">
                {initials}
              </div>
            </div>
          </div>
          
          {/* Info Area */}
          <div className="flex-1 mt-2 md:mt-4">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                {profile.name}
              </h1>
              <CheckCircle2 className="h-7 w-7 text-green-500 drop-shadow-sm" />
            </div>
            
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 font-light max-w-2xl leading-relaxed">
              {profile.bio}
            </p>
            
            {/* Skills */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2.5 mb-10">
              {profile.skills?.map((skill: string) => (
                <span key={skill} className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                  {skill}
                </span>
              ))}
            </div>
            
            {/* ONLY Entry to Messaging System */}
            <form action={initiateDealRoom} className="flex justify-center md:justify-start">
              <input type="hidden" name="freelancerId" value={profile.id} />
              <button 
                type="submit" 
                className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 px-10 py-4 rounded-full font-bold shadow-xl shadow-slate-900/20 dark:shadow-white/10 hover:-translate-y-1 transition-all duration-300 text-lg group"
              >
                <MessageSquare className="h-5 w-5 fill-current opacity-80 group-hover:scale-110 transition-transform" /> 
                Message Freelancer
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* PORTFOLIO GRID SECTION */}
      <section className="bg-slate-50 dark:bg-[#0B0F19] py-24 border-t border-slate-200/50 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-slate-900 dark:text-white">Selected Works</h2>
            <p className="text-slate-500 text-lg max-w-2xl">Case studies highlighting recent value delivered to clients.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {portfolios.map((item: any, i: number) => (
              <div key={item.id || i} className="group cursor-pointer">
                <div className="w-full aspect-[4/3] rounded-[2.5rem] bg-slate-800 mb-6 overflow-hidden relative shadow-sm group-hover:shadow-2xl transition-all duration-500 border border-slate-800/50">
                  {/* Real Image or Decorative Gradient Fallback */}
                  {item.image_url ? (
                    <div 
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                      style={{ backgroundImage: `url(${item.image_url})` }}
                    />
                  ) : (
                    <div className={`absolute inset-0 group-hover:scale-105 transition-transform duration-700 ${i % 2 === 0 ? "bg-gradient-to-br from-indigo-500/10 to-purple-600/20" : "bg-gradient-to-br from-blue-500/10 to-cyan-600/20"}`} />
                  )}
                  
                  {/* Hover Overlay for External Link */}
                  {item.external_link && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                       <Link 
                         href={item.external_link} 
                         target="_blank" 
                         className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full font-bold shadow-xl hover:bg-indigo-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                       >
                         View Live Project <ExternalLink className="h-4 w-4" />
                       </Link>
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-500 leading-relaxed max-w-lg">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="bg-white dark:bg-[#151B2B] py-24 border-t border-slate-200/50 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center p-3.5 bg-amber-50 dark:bg-amber-500/10 rounded-2xl mb-6 text-amber-500 shadow-sm border border-amber-100 dark:border-amber-900/30">
              <Zap className="h-7 w-7" />
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-5 text-slate-900 dark:text-white">Ready to start?</h2>
            <p className="text-slate-500 text-xl font-light">
              Select a service below to initiate a private deal room and begin discussing your project details natively.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((svc: any, i: number) => (
              <div key={svc.id || i} className="bg-slate-50 dark:bg-[#0B0F19] rounded-[2.5rem] p-10 border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-xl dark:shadow-none hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group flex flex-col h-full">
                {/* Visual Flair */}
                <div className={`absolute top-0 right-0 p-16 rounded-full blur-[50px] transition-colors pointer-events-none ${i % 2 === 0 ? "bg-primary-50 dark:bg-primary-500/5 group-hover:bg-primary-100 dark:group-hover:bg-primary-500/10" : "bg-purple-50 dark:bg-purple-500/5 group-hover:bg-purple-100 dark:group-hover:bg-purple-500/10"}`} />
                
                <div className="relative z-10 flex-1 flex flex-col">
                  <h3 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {svc.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-8 flex-1 text-lg leading-relaxed font-light">
                    {svc.description}
                  </p>
                  
                  <div className="flex items-center gap-3 mb-8">
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {svc.deliveryTime || "TBD"}
                    </div>
                  </div>

                  <div className="flex items-end justify-between border-t border-slate-200/60 dark:border-slate-800 pt-8">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Investment
                      </p>
                      {svc.isNegotiable || !svc.price ? (
                        <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Flexible</p>
                      ) : (
                        <p className="text-3xl font-bold text-slate-900 dark:text-white flex items-center tracking-tight">
                          <DollarSign className="w-6 h-6 text-slate-400 -mr-1" />
                          {svc.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                    
                    {/* Send client to messaging deal room logic */}
                    <form action={initiateDealRoom}>
                      <input type="hidden" name="freelancerId" value={profile.id} />
                      <button type="submit" className="bg-slate-900 dark:bg-white p-3.5 rounded-full text-white dark:text-slate-900 group-hover:bg-primary-600 group-hover:text-white dark:group-hover:bg-primary-500 dark:group-hover:text-white transition-all duration-300 shadow-md transform group-hover:scale-110">
                        <ArrowRight className="h-6 w-6" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full py-16 text-center text-slate-500 text-sm border-t border-slate-800 bg-[#0B0F19]">
        <p>Built with <Link href="/" className="font-bold text-white hover:text-indigo-400 transition-colors">FreelanceOS</Link>. Professional software for independents.</p>
      </footer>
    </div>
  );
}
