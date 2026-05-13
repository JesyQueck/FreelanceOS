import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, FileText, MessageCircle, BarChart3, Star, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg-main)] text-[var(--color-text-primary)] selection:bg-[var(--color-primary)]/30">
      
      {/* Premium Background with Dot Grid */}
      <div className="fixed inset-0 dot-grid pointer-events-none" />
      
      {/* Subtle Blur Elements */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-[var(--color-primary)] subtle-blur rounded-full pointer-events-none" />
      <div className="fixed bottom-20 left-20 w-64 h-64 bg-[var(--color-accent)] subtle-blur rounded-full pointer-events-none" />
      
      {/* 1. NAVIGATION BAR */}
      <nav className="fixed w-full z-50 top-0 border-b border-[var(--color-border)] bg-[var(--color-bg-card)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-[var(--color-primary)] p-2 rounded-lg text-white shadow-sm shadow-[var(--color-primary)]/20 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-[var(--color-text-primary)]">
              FreelanceOS
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-text-secondary)]">
            <Link to="#how-it-works" className="hover:text-[var(--color-primary)] transition-colors">How it works</Link>
            <Link to="#features" className="hover:text-[var(--color-primary)] transition-colors">Features</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors flex items-center">
              Log in
            </Link>
            <Link to="/signup" className="btn btn-primary text-sm font-medium">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full flex flex-col pt-20">
        
        {/* 2. HERO SECTION */}
        <section className="relative overflow-hidden w-full pt-28 pb-16 lg:pt-36 lg:pb-24 flex flex-col items-center text-center px-8">
          {/* Background Glows Refined */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--color-primary)]/10 blur-[80px] rounded-full point-events-none -z-10" />
          
          <div className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-4 py-1.5 text-xs font-semibold text-[var(--color-primary)] mb-8 border border-[var(--color-primary)]/20">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
            Join 10,000+ top independent professionals
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)] max-w-3xl leading-tight mb-5">
            Turn Your Freelance Work Into a {" "}
            <span className="text-[var(--color-primary)]">
              Professional Experience
            </span>
          </h1>
          
          <p className="mx-auto max-w-[500px] text-sm md:text-base text-[var(--color-text-secondary)] mb-8 leading-relaxed">
            Stop relying on marketplaces. Build a breathtaking portfolio, package your services, and manage client communications in your own branded workspace.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-8">
            <Link
              to="/signup"
              className="btn btn-primary px-8 py-4 shadow-lg shadow-[var(--color-primary)]/20 group"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="#how-it-works"
              className="btn btn-secondary px-8 py-4 border border-[var(--color-border)]"
            >
              Learn More
            </Link>
          </div>
        </section>

        {/* 3. PROFILE PREVIEW SECTION */}
        <section id="demo" className="w-full px-8 py-12 flex justify-center -mt-8 relative z-10">
          <div className="w-full max-w-6xl rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-card)]/50 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <div className="rounded-[1.5rem] overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-inner">
              {/* Fake Browser Window Header */}
              <div className="h-14 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] flex items-center px-6 gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[var(--color-error)]" />
                  <div className="h-3 w-3 rounded-full bg-[var(--color-warning)]" />
                  <div className="h-3 w-3 rounded-full bg-[var(--color-success)]" />
                </div>
                <div className="mx-auto flex h-8 w-64 items-center justify-center rounded-md bg-[var(--color-bg-muted)] text-xs font-medium text-[var(--color-text-secondary)] shadow-sm border border-[var(--color-border)]/50 line-clamp-1">
                  freelanceos.com/alex-design
                </div>
              </div>
              
              {/* Mock UI Content */}
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-12 items-start">
                  <div className="w-full md:w-1/3 flex flex-col gap-6">
                    <div className="h-20 w-20 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 flex items-center justify-center">
                      <span className="text-xl font-bold text-[var(--color-primary)]">AR</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <h2 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">Alex Rivera</h2>
                        <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
                      </div>
                      <p className="text-[var(--color-text-secondary)] mb-6 h-16 line-clamp-3 text-sm leading-relaxed">
                        Digital designer specializing in SaaS UI/UX. I help early-stage startups look like enterprise giants.
                      </p>
                      <button className="btn btn-primary w-full py-2.5 text-sm font-semibold flex items-center justify-center">
                        Message Freelancer
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Fake Service Cards */}
                    <div className="card p-6 hover:scale-[1.02] transition-transform">
                      <h3 className="font-semibold text-base mb-1 text-[var(--color-text-primary)]">Full App Redesign</h3>
                      <p className="text-[var(--color-text-secondary)] text-xs mb-5 leading-relaxed">Complete overhaul of your web app user interface.</p>
                      <div className="flex justify-between items-center text-xs pt-4 border-t border-[var(--color-border)]">
                        <span className="font-semibold text-[var(--color-text-primary)]">From $4,500</span>
                        <span className="text-[var(--color-text-secondary)]">2-3 weeks</span>
                      </div>
                    </div>
                    <div className="card p-6 hover:scale-[1.02] transition-transform">
                      <h3 className="font-semibold text-sm mb-1.5 text-[var(--color-text-primary)]">Brand Identity</h3>
                      <p className="text-[var(--color-text-secondary)] text-xs mb-5 leading-relaxed">Logo, color palette, and complete typography system.</p>
                      <div className="flex justify-between items-center text-xs pt-4 border-t border-[var(--color-border)]">
                        <span className="font-semibold text-[var(--color-text-primary)]">From $2,000</span>
                        <span className="text-[var(--color-text-secondary)]">1 week</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. HOW IT WORKS SECTION */}
        <section id="how-it-works" className="w-full py-24 bg-[var(--color-bg-secondary)]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4 text-[var(--color-text-primary)]">Your entire workflow,<br/>simplified.</h2>
              <p className="text-[var(--color-text-secondary)] text-base">No job boards, no bidding, no commissions taken from your earnings.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent -z-10" />
              
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/50 flex items-center justify-center mb-5 shrink-0">
                  <span className="text-base font-bold text-[var(--color-primary)]">1</span>
                </div>
                <h3 className="text-base font-bold mb-2 text-[var(--color-text-primary)]">Create your profile</h3>
                <p className="text-[var(--color-text-secondary)] text-xs leading-relaxed max-w-sm">Launch a beautiful portfolio that showcases your best work and packages your services simply.</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/50 flex items-center justify-center mb-5 shrink-0">
                  <span className="text-base font-bold text-[var(--color-primary)]">2</span>
                </div>
                <h3 className="text-base font-bold mb-2 text-[var(--color-text-primary)]">Share with clients</h3>
                <p className="text-[var(--color-text-secondary)] text-xs leading-relaxed max-w-sm">Send your custom link to leads. They can view your offerings and hire you directly in one click.</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/50 flex items-center justify-center mb-5 shrink-0">
                  <span className="text-base font-bold text-[var(--color-primary)]">3</span>
                </div>
                <h3 className="text-base font-bold mb-2 text-[var(--color-text-primary)]">Manage conversations</h3>
                <p className="text-[var(--color-text-secondary)] text-xs leading-relaxed max-w-sm">Streamline project chat, file sharing, and updates in a dedicated portal that impresses clients.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. FEATURES SECTION */}
        <section id="features" className="w-full py-24 bg-[var(--color-bg-secondary)]">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-2xl md:text-4xl font-bold mb-6 leading-tight text-[var(--color-text-primary)]">Everything you need to <br/>run a solo agency.</h2>
                <div className="space-y-8 mt-10">
                  <div className="flex gap-4 items-start">
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border)]">
                      <FileText className="h-5 w-5 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold mb-1 text-[var(--color-text-primary)]">Notion-like Portfolio</h4>
                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed max-w-sm">Rich text, dynamic embeds, and incredibly fast editing. Your past work has never looked better.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border)]">
                      <BarChart3 className="h-5 w-5 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold mb-1 text-[var(--color-text-primary)]">Service Menus</h4>
                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed max-w-sm">Sell your skills like products. Define prices, timelines, and deliverables so expectations are perfectly set.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="flex items-center justify-center w-10 h-10 shrink-0 bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border)]">
                      <MessageCircle className="h-5 w-5 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold mb-1 text-[var(--color-text-primary)]">Real-time Messaging</h4>
                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed max-w-sm">Integrated client portals mean you can stop losing track of requirements in messy email chains.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 rounded-[3rem] transform rotate-3" />
                <div className="card p-10 shadow-xl relative backdrop-blur-sm rounded-[2.5rem]">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <p className="text-sm text-[var(--color-text-secondary)] font-medium">New Message</p>
                      <h5 className="text-lg font-semibold text-[var(--color-text-primary)]">Client: Sarah Jenkins</h5>
                    </div>
                    <div className="h-10 w-10 bg-[var(--color-bg-card)] rounded-full flex items-center justify-center">
                      <Star className="h-5 w-5 text-[var(--color-primary)]" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-[var(--color-bg-secondary)]/50 p-4 rounded-2xl rounded-tr-sm border border-[var(--color-border)] w-4/5 ml-auto text-sm text-[var(--color-primary)]">
                      Hi! I saw your portfolio and I'm interested in Full App Redesign service. Do you have availability next month?
                    </div>
                    <div className="bg-[var(--color-primary)]/10 p-4 rounded-2xl rounded-tl-sm border border-[var(--color-primary)]/30 w-4/5 text-sm text-[var(--color-text-primary)]">
                      Hi Sarah! Thanks for reaching out. Yes, I have availability starting from 15th. Would you like to schedule a quick call to discuss your project?
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FINAL CTA */}
        <section className="w-full py-32 px-8">
          <div className="max-w-5xl mx-auto rounded-[3rem] card text-[var(--color-text-primary)] overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/10 mix-blend-overlay" />
            <div className="absolute top-0 right-0 p-32 bg-[var(--color-primary)]/20 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 p-32 bg-[var(--color-primary)]/10 blur-[100px] rounded-full" />
            
            <div className="relative z-10 px-8 py-20 text-center flex flex-col items-center">
              <h2 className="text-2xl md:text-4xl font-bold mb-6 tracking-tight text-[var(--color-text-primary)]">Ready to upgrade your<br/>freelance career?</h2>
              <p className="text-[var(--color-text-secondary)] text-sm md:text-base max-w-xl mb-10">
                Join our private beta today and get early access to most powerful tool built specifically for independent professionals.
              </p>
              <Link
                to="/login"
                className="btn btn-primary px-8 py-3 shadow-xl shadow-[var(--color-primary)]/20"
              >
                Create your Free Account
              </Link>
            </div>
          </div>
        </section>
        
      </main>

      <footer className="w-full py-12 px-8 border-t border-[var(--color-border)] text-center text-sm text-[var(--color-text-secondary)] mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[var(--color-primary)]" />
            <span className="font-semibold text-[var(--color-text-primary)] font-bold">FreelanceOS</span>
          </div>
          <p>© 2026 FreelanceOS. Designed for world-class talent.</p>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-[var(--color-text-primary)] transition-colors">Twitter</Link>
            <Link to="#" className="hover:text-[var(--color-text-primary)] transition-colors">Dribbble</Link>
            <Link to="#" className="hover:text-[var(--color-text-primary)] transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
