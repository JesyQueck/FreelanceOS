import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, FileText, MessageCircle, BarChart3, Star, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-[#FFD700]/30">
      
      {/* 1. NAVIGATION BAR */}
      <nav className="fixed w-full z-50 top-0 border-b border-[#1A1A1A]/50 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#FFD700] p-2 rounded-lg text-black shadow-sm flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">
              FreelanceOS
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#A0A0A0]">
            <Link to="#how-it-works" className="hover:text-[#FFD700] transition-colors">How it works</Link>
            <Link to="#features" className="hover:text-[#FFD700] transition-colors">Features</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-[#A0A0A0] hover:text-white transition-colors flex items-center">
              Log in
            </Link>
            <Link to="/signup" className="text-sm font-medium bg-[#FFD700] text-black px-5 py-2 rounded-lg hover:bg-[#FFC700] transition-all shadow-sm flex items-center">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full flex flex-col pt-20">
        
        {/* 2. HERO SECTION */}
        <section className="relative overflow-hidden w-full pt-28 pb-16 lg:pt-36 lg:pb-24 flex flex-col items-center text-center px-8">
          {/* Background Glows Refined */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#FFD700]/10 blur-[80px] rounded-full point-events-none -z-10" />
          
          <div className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FFD700]/10 px-4 py-1.5 text-xs font-semibold text-[#FFD700] mb-8 border border-[#FFD700]/20">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[#FFD700] animate-pulse" />
            Join 10,000+ top independent professionals
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-tight mb-5">
            Turn Your Freelance Work Into a {" "}
            <span className="text-[#FFD700]">
              Professional Experience
            </span>
          </h1>
          
          <p className="mx-auto max-w-[500px] text-sm md:text-base text-[#A0A0A0] mb-8 leading-relaxed">
            Stop relying on marketplaces. Build a breathtaking portfolio, package your services, and manage client communications in your own branded workspace.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-8">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#FFD700] text-black font-semibold rounded-xl hover:bg-[#FFC700] transition-all shadow-lg shadow-[#FFD700]/20 group"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="#how-it-works"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#0A0A0A] text-white font-semibold rounded-xl hover:bg-[#1A1A1A] transition-all border border-[#1A1A1A]/60"
            >
              Learn More
            </Link>
          </div>
        </section>

        {/* 3. PROFILE PREVIEW SECTION */}
        <section id="demo" className="w-full px-8 py-12 flex justify-center -mt-8 relative z-10">
          <div className="w-full max-w-6xl rounded-[2rem] border border-[#1A1A1A]/50 bg-[#0A0A0A]/50 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <div className="rounded-[1.5rem] overflow-hidden border border-[#1A1A1A] bg-[#0A0A0A] shadow-inner">
              {/* Fake Browser Window Header */}
              <div className="h-14 bg-black border-b border-[#1A1A1A] flex items-center px-6 gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="mx-auto flex h-8 w-64 items-center justify-center rounded-md bg-[#1A1A1A] text-xs font-medium text-[#A0A0A0] shadow-sm border border-[#2A2A2A]/50 line-clamp-1">
                  freelanceos.com/alex-design
                </div>
              </div>
              
              {/* Mock UI Content */}
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-12 items-start">
                  <div className="w-full md:w-1/3 flex flex-col gap-6">
                    <div className="h-20 w-20 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center">
                      <span className="text-xl font-bold text-[#FFD700]">AR</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <h2 className="text-xl font-bold tracking-tight text-white">Alex Rivera</h2>
                        <CheckCircle2 className="h-4 w-4 text-[#FFD700] shrink-0" />
                      </div>
                      <p className="text-[#A0A0A0] mb-6 h-16 line-clamp-3 text-sm leading-relaxed">
                        Digital designer specializing in SaaS UI/UX. I help early-stage startups look like enterprise giants.
                      </p>
                      <button className="w-full py-2.5 bg-[#FFD700] text-black rounded-lg text-sm font-semibold shadow-sm hover:bg-[#FFC700] transition-colors flex items-center justify-center">
                        Message Freelancer
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Fake Service Cards */}
                    <div className="p-6 rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A]/50 hover:bg-[#1A1A1A]/50 transition-colors shadow-sm">
                      <h3 className="font-semibold text-base mb-1 text-white">Full App Redesign</h3>
                      <p className="text-[#A0A0A0] text-xs mb-5 leading-relaxed">Complete overhaul of your web app user interface.</p>
                      <div className="flex justify-between items-center text-xs pt-4 border-t border-[#1A1A1A]/80">
                        <span className="font-semibold text-white">From $4,500</span>
                        <span className="text-[#A0A0A0]">2-3 weeks</span>
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] hover:shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#FFD700]">
                      <h3 className="font-semibold text-sm mb-1.5 text-white">Brand Identity</h3>
                      <p className="text-[#A0A0A0] text-xs mb-5 leading-relaxed">Logo, color palette, and complete typography system.</p>
                      <div className="flex justify-between items-center text-xs pt-4 border-t border-[#1A1A1A]/80">
                        <span className="font-semibold text-white">From $2,000</span>
                        <span className="text-[#A0A0A0]">1 week</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. HOW IT WORKS SECTION */}
        <section id="how-it-works" className="w-full py-24 bg-[#0A0A0A]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4 text-white">Your entire workflow,<br/>simplified.</h2>
              <p className="text-[#A0A0A0] text-base">No job boards, no bidding, no commissions taken from your earnings.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-[#1A1A1A] to-transparent -z-10" />
              
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-[#FFD700]/20 border border-[#FFD700]/50 flex items-center justify-center mb-5 shrink-0">
                  <span className="text-base font-bold text-[#FFD700]">1</span>
                </div>
                <h3 className="text-base font-bold mb-2 text-white">Create your profile</h3>
                <p className="text-[#A0A0A0] text-xs leading-relaxed max-w-sm">Launch a beautiful portfolio that showcases your best work and packages your services simply.</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-[#FFD700]/20 border border-[#FFD700]/50 flex items-center justify-center mb-5 shrink-0">
                  <span className="text-base font-bold text-[#FFD700]">2</span>
                </div>
                <h3 className="text-base font-bold mb-2 text-white">Share with clients</h3>
                <p className="text-[#A0A0A0] text-xs leading-relaxed max-w-sm">Send your custom link to leads. They can view your offerings and hire you directly in one click.</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-[#FFD700]/20 border border-[#FFD700]/50 flex items-center justify-center mb-5 shrink-0">
                  <span className="text-base font-bold text-[#FFD700]">3</span>
                </div>
                <h3 className="text-base font-bold mb-2 text-white">Manage conversations</h3>
                <p className="text-[#A0A0A0] text-xs leading-relaxed max-w-sm">Streamline project chat, file sharing, and updates in a dedicated portal that impresses clients.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. FEATURES SECTION */}
        <section id="features" className="w-full py-24 bg-[#0A0A0A]">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-2xl md:text-4xl font-bold mb-6 leading-tight text-white">Everything you need to <br/>run a solo agency.</h2>
                <div className="space-y-8 mt-10">
                  <div className="flex gap-4 items-start">
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
                      <FileText className="h-5 w-5 text-[#FFD700]" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold mb-1">Notion-like Portfolio</h4>
                      <p className="text-xs text-[#A0A0A0] leading-relaxed max-w-sm">Rich text, dynamic embeds, and incredibly fast editing. Your past work has never looked better.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
                      <BarChart3 className="h-5 w-5 text-[#FFD700]" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold mb-1">Service Menus</h4>
                      <p className="text-xs text-[#A0A0A0] leading-relaxed max-w-sm">Sell your skills like products. Define prices, timelines, and deliverables so expectations are perfectly set.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
                      <MessageCircle className="h-5 w-5 text-[#FFD700]" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold mb-1">Real-time Messaging</h4>
                      <p className="text-xs text-[#A0A0A0] leading-relaxed max-w-sm">Integrated client portals mean you can stop losing track of requirements in messy email chains.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#FFD700]/10 to-[#FFD700]/5 rounded-[3rem] transform rotate-3" />
                <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-[2.5rem] p-10 shadow-xl relative backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <p className="text-sm text-[#A0A0A0] font-medium">New Message</p>
                      <h5 className="text-lg font-semibold text-white">Client: Sarah Jenkins</h5>
                    </div>
                    <div className="h-10 w-10 bg-[#1A1A1A] rounded-full flex items-center justify-center">
                      <Star className="h-5 w-5 text-[#FFD700]" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-[#1A1A1A]/50 p-4 rounded-2xl rounded-tr-sm border border-[#2A2A2A] w-4/5 ml-auto text-sm text-[#FFD700]">
                      Hi! I saw your portfolio and I'm interested in the Full App Redesign service. Do you have availability next month?
                    </div>
                    <div className="bg-[#FFD700]/10 p-4 rounded-2xl rounded-tl-sm border border-[#FFD700]/30 w-4/5 text-sm text-white">
                      Hi Sarah! Thanks for reaching out. Yes, I have availability starting from the 15th. Would you like to schedule a quick call to discuss your project?
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FINAL CTA */}
        <section className="w-full py-32 px-8">
          <div className="max-w-5xl mx-auto rounded-[3rem] bg-[#0A0A0A] text-white overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/20 to-[#FFD700]/10 mix-blend-overlay" />
            <div className="absolute top-0 right-0 p-32 bg-[#FFD700]/20 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 p-32 bg-[#FFD700]/10 blur-[100px] rounded-full" />
            
            <div className="relative z-10 px-8 py-20 text-center flex flex-col items-center">
              <h2 className="text-2xl md:text-4xl font-bold mb-6 tracking-tight text-white">Ready to upgrade your<br/>freelance career?</h2>
              <p className="text-[#A0A0A0] text-sm md:text-base max-w-xl mb-10">
                Join our private beta today and get early access to the most powerful tool built specifically for independent professionals.
              </p>
              <Link
                to="/login"
                className="bg-[#FFD700] text-black px-8 py-3 rounded-full font-semibold text-sm hover:bg-[#FFC700] transition-colors shadow-xl shadow-[#FFD700]/20"
              >
                Create your Free Account
              </Link>
            </div>
          </div>
        </section>
        
      </main>

      <footer className="w-full py-12 px-8 border-t border-[#1A1A1A]/50 text-center text-sm text-[#A0A0A0] mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#FFD700]" />
            <span className="font-semibold text-white font-bold">FreelanceOS</span>
          </div>
          <p>© 2026 FreelanceOS. Designed for world-class talent.</p>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-white transition-colors">Twitter</Link>
            <Link to="#" className="hover:text-white transition-colors">Dribbble</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
