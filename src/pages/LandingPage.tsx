import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, FileText, Share2, MessageCircle, BarChart3, Star, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0B0F19] text-white selection:bg-indigo-500/30">
      
      {/* 1. NAVIGATION BAR */}
      <nav className="fixed w-full z-50 top-0 border-b border-slate-800/50 bg-[#0B0F19]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-sm flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">
              FreelanceOS
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link to="#how-it-works" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">How it works</Link>
            <Link to="#features" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Features</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center">
              Log in
            </Link>
            <Link to="/login" className="text-sm font-medium bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-sm flex items-center">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full flex flex-col pt-20">
        
        {/* 2. HERO SECTION */}
        <section className="relative overflow-hidden w-full pt-28 pb-16 lg:pt-36 lg:pb-24 flex flex-col items-center text-center px-8">
          {/* Background Glows Refined */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-500/10 dark:bg-primary-500/5 blur-[80px] rounded-full point-events-none -z-10" />
          
          <div className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400 mb-8 border border-indigo-500/20">
            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Join 10,000+ top independent professionals
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-tight mb-5">
            Turn Your Freelance Work Into a {" "}
            <span className="text-indigo-400">
              Professional Experience
            </span>
          </h1>
          
          <p className="mx-auto max-w-[500px] text-sm md:text-base text-slate-400 mb-8 leading-relaxed">
            Stop relying on marketplaces. Build a breathtaking portfolio, package your services, and manage client communications in your own branded workspace.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-8">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white transition-all bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm hover:shadow-md gap-2"
            >
              Get Started <ArrowRight className="h-4 w-4 shrink-0 transition-transform hover:translate-x-1" />
            </Link>
            <Link
              to="#demo"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-slate-200 transition-all bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-800/80 shadow-sm gap-2"
            >
              View Demo Profile
            </Link>
          </div>
        </section>

        {/* 3. PROFILE PREVIEW SECTION */}
        <section id="demo" className="w-full px-8 py-12 flex justify-center -mt-8 relative z-10">
          <div className="w-full max-w-6xl rounded-[2rem] border border-slate-700/50 bg-slate-900/50 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <div className="rounded-[1.5rem] overflow-hidden border border-slate-800 bg-[#0F1523] shadow-inner">
              {/* Fake Browser Window Header */}
              <div className="h-14 bg-[#0B0F19] border-b border-slate-800 flex items-center px-6 gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="mx-auto flex h-8 w-64 items-center justify-center rounded-md bg-slate-800 text-xs font-medium text-slate-400 shadow-sm border border-slate-700/50 line-clamp-1">
                  freelanceos.com/alex-design
                </div>
              </div>
              
              {/* Mock UI Content */}
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-12 items-start">
                  <div className="w-full md:w-1/3 flex flex-col gap-6">
                    <div className="h-20 w-20 rounded-2xl bg-indigo-50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center">
                      <span className="text-xl font-bold text-indigo-600">AR</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <h2 className="text-xl font-bold tracking-tight text-white">Alex Rivera</h2>
                        <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0" />
                      </div>
                      <p className="text-slate-500 mb-6 h-16 line-clamp-3 text-sm leading-relaxed">
                        Digital designer specializing in SaaS UI/UX. I help early-stage startups look like enterprise giants.
                      </p>
                      <button className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-indigo-500 transition-colors flex items-center justify-center">
                        Message Freelancer
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Fake Service Cards */}
                    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 transition-colors shadow-sm">
                      <h3 className="font-semibold text-base mb-1 text-white">Full App Redesign</h3>
                      <p className="text-slate-400 text-xs mb-5 leading-relaxed">Complete overhaul of your web app user interface.</p>
                      <div className="flex justify-between items-center text-xs pt-4 border-t border-slate-800/80">
                        <span className="font-semibold text-white">From $4,500</span>
                        <span className="text-slate-400">2-3 weeks</span>
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl border border-slate-800 bg-[#0F1523] hover:shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-500">
                      <h3 className="font-semibold text-sm mb-1.5 text-white">Brand Identity</h3>
                      <p className="text-slate-400 text-xs mb-5 leading-relaxed">Logo, color palette, and complete typography system.</p>
                      <div className="flex justify-between items-center text-xs pt-4 border-t border-slate-800/80">
                        <span className="font-semibold text-white">From $2,000</span>
                        <span className="text-slate-400">1 week</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. HOW IT WORKS SECTION */}
        <section id="how-it-works" className="w-full py-24 bg-[#0B0F19]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4 text-white">Your entire workflow,<br/>simplified.</h2>
              <p className="text-slate-400 text-base">No job boards, no bidding, no commissions taken from your earnings.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-slate-800 to-transparent -z-10" />
              
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-indigo-900/20 border border-indigo-800/50 flex items-center justify-center mb-5 shrink-0">
                  <span className="text-base font-bold text-indigo-400">1</span>
                </div>
                <h3 className="text-base font-bold mb-2 text-white">Create your profile</h3>
                <p className="text-slate-400 text-xs leading-relaxed max-w-sm">Launch a beautiful portfolio that showcases your best work and packages your services simply.</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-indigo-900/20 border border-indigo-800/50 flex items-center justify-center mb-5 shrink-0">
                  <span className="text-base font-bold text-indigo-400">2</span>
                </div>
                <h3 className="text-base font-bold mb-2 text-white">Share with clients</h3>
                <p className="text-slate-400 text-xs leading-relaxed max-w-sm">Send your custom link to leads. They can view your offerings and hire you directly in one click.</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-indigo-900/20 border border-indigo-800/50 flex items-center justify-center mb-5 shrink-0">
                  <span className="text-base font-bold text-indigo-400">3</span>
                </div>
                <h3 className="text-base font-bold mb-2 text-white">Manage conversations</h3>
                <p className="text-slate-400 text-xs leading-relaxed max-w-sm">Streamline project chat, file sharing, and updates in a dedicated portal that impresses clients.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. FEATURES SECTION */}
        <section id="features" className="w-full py-24 bg-[#0B0F19]">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-2xl md:text-4xl font-bold mb-6 leading-tight text-white">Everything you need to <br/>run a solo agency.</h2>
                <div className="space-y-8 mt-10">
                  <div className="flex gap-4 items-start">
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 bg-slate-800 rounded-lg border border-slate-700">
                      <FileText className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold mb-1">Notion-like Portfolio</h4>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-sm">Rich text, dynamic embeds, and incredibly fast editing. Your past work has never looked better.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 bg-slate-800 rounded-lg border border-slate-700">
                      <BarChart3 className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold mb-1">Service Menus</h4>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-sm">Sell your skills like products. Define prices, timelines, and deliverables so expectations are perfectly set.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 bg-slate-800 rounded-lg border border-slate-700">
                      <MessageCircle className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold mb-1">Real-time Messaging</h4>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-sm">Integrated client portals mean you can stop losing track of requirements in messy email chains.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-[3rem] transform rotate-3" />
                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-xl relative backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <p className="text-sm text-slate-400 font-medium">New Message</p>
                      <h5 className="text-lg font-semibold text-white">Client: Sarah Jenkins</h5>
                    </div>
                    <div className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center">
                      <Star className="h-5 w-5 text-amber-500" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-slate-800/50 p-4 rounded-2xl rounded-tr-sm border border-slate-700 w-4/5 ml-auto text-sm text-slate-300">
                      Hi Sarah! Reviewing the wireframes. Looks great.
                    </div>
                    <div className="bg-indigo-900/20 p-4 rounded-2xl rounded-tl-sm border border-indigo-800 w-4/5 text-sm text-slate-300">
                      Thanks! Can we move forward with the high-fidelity designs for the dashboard? Let's proceed.
                    </div>
                  </div>
                  <div className="mt-8 border-t border-slate-800 pt-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-slate-200">Project Stage: Approved</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FINAL CTA */}
        <section className="w-full py-32 px-8">
          <div className="max-w-5xl mx-auto rounded-[3rem] bg-slate-900 dark:bg-slate-800 text-white overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 mix-blend-overlay" />
            <div className="absolute top-0 right-0 p-32 bg-primary-500/20 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 p-32 bg-purple-500/20 blur-[100px] rounded-full" />
            
            <div className="relative z-10 px-8 py-20 text-center flex flex-col items-center">
              <h2 className="text-2xl md:text-4xl font-bold mb-6 tracking-tight text-white">Ready to upgrade your<br/>freelance career?</h2>
              <p className="text-slate-300 text-sm md:text-base max-w-xl mb-10">
                Join our private beta today and get early access to the most powerful tool built specifically for independent professionals.
              </p>
              <Link
                to="/login"
                className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-indigo-500 transition-colors shadow-xl shadow-indigo-600/20"
              >
                Create your Free Account
              </Link>
            </div>
          </div>
        </section>
        
      </main>

      <footer className="w-full py-12 px-8 border-t border-slate-200/50 dark:border-slate-800/50 text-center text-sm text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-slate-400" />
            <span className="font-semibold text-slate-900 dark:text-white">FreelanceOS</span>
          </div>
          <p>© 2026 FreelanceOS. Designed for world-class talent.</p>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Twitter</Link>
            <Link to="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Dribbble</Link>
            <Link to="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
