"use client";
import React, { useState } from "react";
import { 
  HeartHandshake, 
  Stethoscope, 
  Users, 
  ShieldCheck, 
  Zap, 
  ChevronDown, 
  ArrowRight, 
  Menu, 
  X, 
  CheckCircle2,
  Activity,
  CloudLightning,
  MapPin,
  Smartphone,
  Info,
  Link
} from "lucide-react";
import { redirect } from "next/navigation";

/**
 * Custom Image component to handle loading fallbacks
 */
const SafeImage = ({ src, alt, className }) => {
  const [error, setError] = useState(false);
  const fallback = "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=60&w=800";

  return (
    <img
      src={error ? fallback : src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100">
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <HeartHandshake size={24} />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 italic">Caresora</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#about">About</NavLink>
            <NavLink href="#benefits">Benefits</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
            <a href="/login"><button  className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95">
              Launch Dashboard
            </button></a>
          </div>

          <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 p-6 space-y-4 animate-in slide-in-from-top duration-300">
            <NavLink href="#about" mobile onClick={() => setIsMenuOpen(false)}>About</NavLink>
            <NavLink href="#benefits" mobile onClick={() => setIsMenuOpen(false)}>Benefits</NavLink>
            <NavLink href="#faq" mobile onClick={() => setIsMenuOpen(false)}>FAQ</NavLink>
            <a href="/login"><button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold">Launch Dashboard</button></a>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-20 lg:pt-10 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-emerald-50 rounded-full blur-3xl opacity-60" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold border border-indigo-100">
              <Zap size={16} /> <span>Digitizing Global Health Frontiers</span>
            </div>
            <h1 className="text-5xl  lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Bridging the gap in <span className="text-indigo-600">Rural Healthcare.</span>
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-xl">
              Caresora is a clinical dashboard designed for the last mile, enabling field workers to collect data and doctors to triage care in underserved areas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/login"><button className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:-translate-y-1">
                Get Started <ArrowRight size={20} />
              </button></a>
              <a href="#about"><button className="flex items-center justify-center gap-2 bg-white border-2 border-slate-100 text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">
                Learn More
              </button></a>
            </div>
          </div>

          <div className="relative animate-in fade-in zoom-in duration-1000">
            <div className="relative z-10 rounded-[3rem] shadow-2xl overflow-hidden group">
              <SafeImage 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2070" 
                alt="Doctor using tablet" 
                className="w-full h-full object-cover aspect-[4/5] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
              
              {/* Floating Stat Card */}
              <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                      <Activity size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400">Total Visits</p>
                      <p className="text-xl font-black text-slate-900">48,290+</p>
                    </div>
                  </div>
                  <div className="text-emerald-500 font-bold text-sm">+12% MoM</div>
                </div>
              </div>
            </div>
            {/* Background Blob Decoration */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-100 rounded-full -z-0" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-100 rounded-full -z-0" />
          </div>
        </div>
      </section>

      {/* --- ABOUT SECTION --- */}
      <section id="about" className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative group">
              <SafeImage 
                src="https://content.jdmagicbox.com/v2/comp/hyderabad/i3/040pxx40.xx40.241009221012.z3i3/catalogue/yousufain-health-care-clinic-indira-gandhi-puram-hyderabad-hospitals-mpta3ne3vd.jpg" 
                alt="Rural health clinic" 
                className="rounded-[3rem] shadow-2xl relative z-10 grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-indigo-600 rounded-[3rem] -z-0" />
              <div className="absolute top-12 -left-12 bg-white p-4 rounded-2xl shadow-xl z-20 flex items-center gap-3 animate-bounce-slow">
                 <MapPin className="text-red-500" />
                 <span className="text-sm font-bold">500+ Villages</span>
              </div>
            </div>

            <div className="space-y-8">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                <Info size={24} />
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Our Mission: Every life counts, every record matters.</h2>
              <p className="text-lg text-slate-500 leading-relaxed">
                In many rural regions, medical history is fragmented or non-existent. Caresora digitizes the patient journey, ensuring even the most remote individuals have a longitudinal health record accessible to clinical teams.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CheckItem text="Data-Driven Triage" />
                <CheckItem text="Offline-First Logic" />
                <CheckItem text="Rural Mobility Support" />
                <CheckItem text="Encrypted History" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- BENEFITS SECTION --- */}
      <section id="benefits" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-black text-slate-900">Platform Benefits</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">Designed for three distinct roles, creating a unified ecosystem for public health.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <BenefitCard 
              role="For Doctors"
              title="Remote Triage"
              desc="Review high-risk patients from your clinic without traveling to remote sites."
              image="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=1964"
              icon={<Stethoscope className="text-indigo-600" />}
              features={["Risk detection", "Historical trends", "Digital prescriptions"]}
            />
            <BenefitCard 
              role="For Workers"
              title="Guided Screening"
              desc="Intuitive data entry for vitals and symptoms in low-connectivity fields."
              image="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=2042"
              icon={<Users className="text-emerald-600" />}
              features={["Offline entry", "Village tracking", "Task checklists"]}
            />
            <BenefitCard 
              role="For Patients"
              title="Health Identity"
              desc="A permanent digital health card accessible across different centers."
              image="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=2070"
              icon={<ShieldCheck className="text-purple-600" />}
              features={["Mobile access", "Care continuity", "SMS notifications"]}
            />
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-black text-slate-900">Common Questions</h2>
            <p className="text-slate-500 text-lg">Expert answers to common implementation queries.</p>
          </div>

          <div className="space-y-4">
            <FaqItem 
              question="Does it work without internet?"
              answer="Yes! Our mobile application for field workers is designed to cache all data locally and sync automatically as soon as a stable connection is detected."
            />
            <FaqItem 
              question="How secure is patient data?"
              answer="We use industry-standard AES-256 encryption for data at rest and TLS for data in transit. Access is restricted via role-based authentication."
            />
            <FaqItem 
              question="Is this compatible with government ID systems?"
              answer="Caresora is built with modular API architecture, allowing it to integrate with national digital health missions and local registries."
            />
            <FaqItem 
              question="Can patients access their own records?"
              answer="Absolutely. Patients have a dedicated login where they can view their medical history and messages left by doctors."
            />
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                <HeartHandshake size={24} />
              </div>
              <span className="text-xl font-black italic">Caresora</span>
            </div>
            <p className="text-slate-400 max-w-xs leading-relaxed">
              Advancing rural health equity through robust, user-friendly digital infrastructure.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold uppercase text-[10px] tracking-[0.2em] text-indigo-400">Platform</h4>
            <FooterLink>Dashboard</FooterLink>
            <FooterLink>Benifits</FooterLink>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold uppercase text-[10px] tracking-[0.2em] text-indigo-400">Company</h4>
            <FooterLink>About Us</FooterLink>
            <FooterLink>Contact</FooterLink>
            <FooterLink>FAQ</FooterLink>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-20 border-t border-slate-800 mt-20 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} Caresora. Empowering rural health communities.
        </div>
      </footer>
    </div>
  );
}

/* --- UI COMPONENTS --- */

function NavLink({ href, children, mobile, onClick }) {
  return (
    <a 
  href={href} 
  onClick={onClick}
  className={`text-slate-600 font-bold hover:text-indigo-600 transition-colors ${mobile ? "block text-xl" : "text-sm"}`}
>
  {children}
</a>
  );
}

function CheckItem({ text }) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle2 size={18} className="text-emerald-500" />
      <span className="text-slate-700 font-bold text-sm tracking-tight">{text}</span>
    </div>
  );
}

function BenefitCard({ role, title, desc, icon, features, image }) {
  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden hover:shadow-xl transition-all hover:-translate-y-2 group">
      <div className="h-48 overflow-hidden relative">
        <SafeImage src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
          {role}
        </div>
      </div>
      <div className="p-8 space-y-6">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center -mt-16 relative z-10 shadow-lg border-4 border-white">
          {icon}
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-900">{title}</h3>
          <p className="text-slate-500 font-medium text-sm leading-relaxed">{desc}</p>
        </div>
        <ul className="space-y-3 pt-4">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-xs font-bold text-slate-600 tracking-tight">
              <CheckCircle2 size={14} className="text-indigo-400" /> {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors hover:bg-slate-50"
      >
        <span className="font-bold text-slate-900">{question}</span>
        <ChevronDown size={20} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="px-6 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-sm text-slate-500 font-medium leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

function FooterLink({ children }) {
  return (
    <a href="#" className="block text-sm text-slate-500 hover:text-white transition-colors">
      {children}
    </a>
  );
}