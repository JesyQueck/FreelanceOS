import Link from "next/link";
import { ArrowRight, Briefcase, FileText, Share2, MessageCircle, BarChart3, Star, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0B0F19] selection:bg-primary-500/30">
      
      {/* 1. NAVIGATION BAR */}
      <nav className="fixed w-full z-50 top-0 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary-500 to-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              FreelanceOS
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link href="#how-it-works" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">How it works</Link>
            <Link href="#features" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Features</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/login" className="text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-full hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full flex flex-col pt-20">
        
        {/* 2. HERO SECTION */}
        <section className="relative overflow-hidden w-full pt-32 pb-20 lg:pt-48 lg:pb-32 flex flex-col items-center text-center px-4">
          {/* Background Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-600/20 dark:bg-primary-600/10 blur-[120px] rounded-full point-events-none -z-10" />
          
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 dark:bg-primary-500/10 px-4 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 mb-8 border border-primary-100 dark:border-primary-500/20 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
            Join 10,000+ top independent professionals
          </div>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 dark:text-white max-w-5xl leading-[1.05] mb-8 drop-shadow-sm">
            Turn Your Freelance Work Into a {" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-indigo-500 to-purple-600">
              Professional Experience
            </span>
          </h1>
          
          <p className="mx-auto max-w-[700px] text-lg md:text-xl text-slate-600 dark:text-slate-300 lg:text-2xl mb-12 leading-relaxed font-light">
            Stop relying on marketplaces. Build a breathtaking portfolio, package your services, and manage client communications in your own branded workspace.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-6">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white transition-all bg-primary-600 rounded-full hover:bg-primary-700 shadow-xl shadow-primary-600/20 hover:shadow-primary-600/40 hover:-translate-y-0.5 gap-2"
            >
              Get Started <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-slate-700 dark:text-slate-200 transition-all bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm gap-2"
            >
              View Demo Profile
            </Link>
          </div>
        </section>

        {/* 3. PROFILE PREVIEW SECTION */}
        <section id="demo" className="w-full px-6 py-12 flex justify-center -mt-8 relative z-10">
          <div className="w-full max-w-6xl rounded-[2rem] border border-slate-200/60 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 p-2 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 backdrop-blur-xl">
            <div className="rounded-[1.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0F1523] shadow-inner">
              {/* Fake Browser Window Header */}
              <div className="h-14 bg-slate-50 dark:bg-[#0B0F19] border-b border-slate-100 dark:border-slate-800 flex items-center px-6 gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="mx-auto flex h-8 w-64 items-center justify-center rounded-md bg-white dark:bg-slate-800 text-xs font-medium text-slate-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50 line-clamp-1">
                  freelanceos.com/alex-design
                </div>
              </div>
              
              {/* Mock UI Content */}
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-12 items-start">
                  <div className="w-full md:w-1/3 flex flex-col gap-6">
                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-600 shadow-lg" />
                    <div>
                      <h2 className="text-3xl font-bold mb-2">Alex Rivera</h2>
                      <p className="text-slate-500 mb-4 h-16 line-clamp-3">
                        Award-winning digital designer specializing in SaaS UI/UX. I help startups look like enterprise giants.
                      </p>
                      <button className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium shadow-sm">
                        Hire Me
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Fake Service Cards */}
                    <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm">
                      <h3 className="font-semibold text-lg mb-1">Full App Redesign</h3>
                      <p className="text-slate-500 text-sm mb-6">Complete overhaul of your web app user interface.</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-slate-900 dark:text-white">From $4,500</span>
                        <span className="text-slate-500">2-3 weeks</span>
                      </div>
                    </div>
                    <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm">
                      <h3 className="font-semibold text-lg mb-1">Brand Identity</h3>
                      <p className="text-slate-500 text-sm mb-6">Logo, color palette, and complete typography system.</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-slate-900 dark:text-white">From $2,000</span>
                        <span className="text-slate-500">1 week</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. HOW IT WORKS SECTION */}
        <section id="how-it-works" className="w-full py-24 bg-white dark:bg-[#0B0F19]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Your entire workflow,<br/>simplified.</h2>
              <p className="text-slate-500 text-lg">No job boards, no bidding, no commissions taken from your earnings.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent -z-10" />
              
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-6 shadow-sm">
                  <span className="text-4xl font-bold text-primary-600 bg-clip-text">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Create your profile</h3>
                <p className="text-slate-600 dark:text-slate-400">Launch a beautiful portfolio that showcases your best work and packages your services simply.</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-6 shadow-sm">
                  <span className="text-4xl font-bold text-primary-600 bg-clip-text">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Share with clients</h3>
                <p className="text-slate-600 dark:text-slate-400">Send your custom link to leads. They can view your offerings and hire you directly in one click.</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-6 shadow-sm">
                  <span className="text-4xl font-bold text-primary-600 bg-clip-text">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Manage conversations</h3>
                <p className="text-slate-600 dark:text-slate-400">Streamline project chat, file sharing, and updates in a dedicated portal that impresses clients.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. FEATURES SECTION */}
        <section id="features" className="w-full py-24 bg-slate-50/50 dark:bg-[#0B0F19]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">Everything you need to <br/>run a solo agency.</h2>
                <div className="space-y-8 mt-10">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <FileText className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Notion-like Portfolio</h4>
                      <p className="text-slate-600 dark:text-slate-400">Rich text, dynamic embeds, and incredibly fast editing. Your past work has never looked better.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Service Menus</h4>
                      <p className="text-slate-600 dark:text-slate-400">Sell your skills like products. Define prices, timelines, and deliverables so expectations are perfectly set.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <MessageCircle className="h-6 w-6 text-indigo-500" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Real-time Messaging</h4>
                      <p className="text-slate-600 dark:text-slate-400">Integrated client portals mean you can stop losing track of requirements in messy email chains.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/10 to-purple-600/10 rounded-[3rem] transform rotate-3" />
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl relative backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <p className="text-sm text-slate-500 font-medium">New Message</p>
                      <h5 className="text-lg font-semibold">Client: Sarah Jenkins</h5>
                    </div>
                    <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                      <Star className="h-5 w-5 text-amber-500" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl rounded-tr-sm border border-slate-100 dark:border-slate-700 w-4/5 ml-auto text-sm text-slate-700 dark:text-slate-300">
                      Hi Sarah! Reviewing the wireframes. Looks great.
                    </div>
                    <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-2xl rounded-tl-sm border border-primary-100 dark:border-primary-800 w-4/5 text-sm text-slate-700 dark:text-slate-300">
                      Thanks! Can we move forward with the high-fidelity designs for the dashboard? Let's proceed.
                    </div>
                  </div>
                  <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">Project Stage: Approved</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FINAL CTA */}
        <section className="w-full py-32 px-6">
          <div className="max-w-5xl mx-auto rounded-[3rem] bg-slate-900 dark:bg-slate-800 text-white overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 mix-blend-overlay" />
            <div className="absolute top-0 right-0 p-32 bg-primary-500/20 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 p-32 bg-purple-500/20 blur-[100px] rounded-full" />
            
            <div className="relative z-10 px-8 py-20 text-center flex flex-col items-center">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Ready to upgrade your<br/>freelance career?</h2>
              <p className="text-slate-300 text-lg md:text-xl max-w-2xl mb-10">
                Join our private beta today and get early access to the most powerful tool built specifically for independent professionals.
              </p>
              <Link
                href="/login"
                className="bg-white text-slate-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-slate-100 transition-colors shadow-xl shadow-white/10"
              >
                Create your Free Account
              </Link>
            </div>
          </div>
        </section>
        
      </main>

      <footer className="w-full py-12 px-6 border-t border-slate-200/50 dark:border-slate-800/50 text-center text-sm text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-slate-400" />
            <span className="font-semibold text-slate-900 dark:text-white">FreelanceOS</span>
          </div>
          <p>© 2026 FreelanceOS. Designed for world-class talent.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Dribbble</Link>
            <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
