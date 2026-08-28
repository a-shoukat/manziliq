import React from 'react';
import { 
  Building2, 
  Target, 
  Eye, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  Award, 
  CheckCircle2,
  Lock,
  Globe
} from 'lucide-react';

export const HomeAboutUsSection: React.FC = () => {
  const leadershipTeam = [
    {
      name: 'Engr. Tariq Mehmood',
      role: 'Chief Executive Officer & Founder',
      bio: 'Ex-NESPAK Infrastructure Senior Consultant with 18+ years leading housing masterplanning & town planning across Pakistan.',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      badge: 'Urban Infrastructure Lead'
    },
    {
      name: 'Sarah Farooq',
      role: 'Chief Technology Officer',
      bio: 'Former FinTech & Distributed Ledger Systems Architect specializing in smart contracts and digital land registry records.',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
      badge: 'AI & Data Architect'
    },
    {
      name: 'Advocate Malik Bilal',
      role: 'Head of Legal & Land Registry Compliance',
      bio: 'Senior High Court Advocate specializing in Punjab Development Authorities (LDA/CDA/FDA) land titling and TMA approvals.',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
      badge: 'Legal & Registry Jurist'
    },
    {
      name: 'Zainab Arshad',
      role: 'VP of Society Relations & Escrow',
      bio: 'Oversees builder partnerships, transparent escrow fund disbursements, and digital payment reconciliation for buyers.',
      photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
      badge: 'Escrow Operations Lead'
    }
  ];

  return (
    <div className="relative border border-slate-200/90 rounded-3xl p-6 sm:p-12 space-y-12 overflow-hidden bg-white shadow-sm">
      {/* Architectural Skyline & Masterplan Background Image */}
      <div className="absolute inset-0 z-0 opacity-[0.08] pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1600"
          alt="Modern Real Estate Development Headquarters"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-slate-50" />
      </div>

      <div className="relative z-10 space-y-12">
        {/* 1. Header & Trust Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/10 text-blue-900 font-bold text-xs">
            <Building2 className="w-4 h-4 text-blue-900" />
            <span>About ManzilIQ Real Estate Ecosystem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-[Outfit] text-slate-900 tracking-tight">
            Pioneering Transparency in Pakistan’s Real Estate Market
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Founded to eliminate opaque commissions, bogus plot files, and unverified developers, MANZILIQ is Pakistan’s first end-to-end digital property ecosystem connecting verified housing societies with genuine buyers.
          </p>
        </div>

      {/* 2. Mission & Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Mission */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-blue-900 text-amber-400 flex items-center justify-center shadow-md">
            <Target className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold font-[Outfit] text-slate-900">Our Mission</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To empower every Pakistani family and overseas investor with 100% verified property titles, transparent masterplans, digital installment ledgers, and secure escrow protections.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2 text-[11px] font-bold text-slate-700">
            <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Direct Society Allotments
            </span>
            <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Bank & Wallet Integrated Escrow
            </span>
          </div>
        </div>

        {/* Vision */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
            <Eye className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold font-[Outfit] text-slate-900">Our Vision</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To establish the definitive digital standard for real estate in South Asia, where every square foot of land is mapped, audited, and traded with total legal certainty and machine-learning price intelligence.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2 text-[11px] font-bold text-slate-700">
            <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              AI Fair Valuation Model
            </span>
            <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              LDA / CDA Registry Auditing
            </span>
          </div>
        </div>

      </div>

      {/* 3. Leadership Team */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Executive Leadership</span>
          </div>
          <h3 className="text-2xl font-black font-[Outfit] text-slate-900">
            Guided by Proven Industry Veterans
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {leadershipTeam.map((member, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col items-center text-center space-y-3 hover:shadow-md transition"
            >
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-blue-900/20 shadow-inner">
                <img 
                  src={member.photo} 
                  alt={member.name} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-1 w-full">
                <h4 className="font-extrabold text-slate-900 text-sm leading-tight">
                  {member.name}
                </h4>
                <div className="text-[11px] font-bold text-blue-900">
                  {member.role}
                </div>
                <div className="inline-block bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md mt-1">
                  {member.badge}
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};
