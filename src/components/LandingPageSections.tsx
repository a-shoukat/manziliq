import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Calculator, 
  ArrowRight, 
  FileText, 
  Smartphone, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp, 
  UserCheck, 
  Layers, 
  Search, 
  DollarSign, 
  HelpCircle, 
  Quote, 
  Award, 
  FileSpreadsheet, 
  Users,
  Compass
} from 'lucide-react';
import { Society, Plot, Property } from '../types';

interface LandingPageSectionsProps {
  societies: Society[];
  plots: Plot[];
  properties: Property[];
  onSelectSociety: (societyId: string) => void;
  onOpenMap: () => void;
  onOpenEstimator: () => void;
  onOpenMarketplace: () => void;
  onInitiateBooking: (bookingInfo: { plotId: string; title: string; price: number; downPayment: number; societyName: string }) => void;
  onOpenInquiry: (property?: Property, plot?: Plot) => void;
}

export const LandingPageSections: React.FC<LandingPageSectionsProps> = ({
  societies,
  plots,
  properties,
  onSelectSociety,
  onOpenMap,
  onOpenEstimator,
  onOpenMarketplace,
  onInitiateBooking,
  onOpenInquiry,
}) => {
  // Calculator State
  const [calcMarla, setCalcMarla] = useState<number>(5);
  const [calcTenureMonths, setCalcTenureMonths] = useState<number>(36);
  const [calcSocietyId, setCalcSocietyId] = useState<string>(societies[0]?.id || 'soc-1');

  // How It Works Tab State
  const [howItWorksUserType, setHowItWorksUserType] = useState<'buyer' | 'dealer'>('buyer');

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Selected society for calculator
  const selectedCalcSociety = societies.find(s => s.id === calcSocietyId) || societies[0];
  const avgMarlaPrice = selectedCalcSociety ? 550000 : 500000;
  
  // Installment Calculations
  const calcTotalPrice = calcMarla * avgMarlaPrice;
  const calcDownPayment = Math.round(calcTotalPrice * 0.20);
  const calcRemaining = calcTotalPrice - calcDownPayment;
  const calcMonthlyInstallment = Math.round(calcRemaining / calcTenureMonths);
  const calcBallotingFee = Math.round(calcTotalPrice * 0.10);

  // Sample Plot for Masterplan Teaser
  const availablePlotsList = plots.filter(p => p.status === 'available');

  const faqs = [
    {
      q: "Are all housing societies listed on MANZILIQ approved by LDA, CDA or municipal TMAs?",
      a: "Yes! Every housing society listed on MANZILIQ undergoes strict legal verification against official Development Authorities (LDA, CDA, RDA, FDA) and Tehsil Municipal Administrations (TMA) records before being approved for digital allotment."
    },
    {
      q: "How does the online plot booking and 20% down payment process work?",
      a: "Select your desired plot from the Interactive Masterplan map, review the 20% down payment breakdown, and initiate online payment via EasyPaisa, JazzCash, or bank wire transfer. Once verified, your QR-coded allotment letter is instantly generated."
    },
    {
      q: "Can I pay monthly plot installments through digital mobile wallets?",
      a: "Absolutely. MANZILIQ includes a digital payment ledger where buyers can pay monthly installments directly from their mobile phone. Every payment generates an official digital receipt with an updated ledger statement."
    },
    {
      q: "How does the AI Price Valuation engine estimate plot market rates?",
      a: "Our heuristic machine learning model analyzes recent verified property sales in major housing societies, factoring in plot dimensions, boulevard width, proximity to civic amenities, and sector development status."
    },
    {
      q: "I am a housing society owner or property dealer. How can I list inventory?",
      a: "Switch to the 'Society Admin' or 'Dealer & Agent' demo persona at the top banner or submit a dealer inquiry to gain access to our bulk CSV inventory uploader and lead CRM pipeline."
    },
    {
      q: "What documents do I receive after completing plot booking?",
      a: "You receive an official QR-verified Allotment Deed, a digital Booking Agreement with society stamp, and a downloadable payment schedule ledger PDF."
    }
  ];

  return (
    <div className="space-y-16 py-8">

      {/* SECTION 1: FEATURED HOUSING SOCIETIES SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-amber-600" />
              <span className="bg-amber-100 text-amber-900 font-bold text-xs px-2.5 py-0.5 rounded border border-amber-300">
                NATIONWIDE VERIFIED INVENTORY
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-[Outfit] text-slate-900">
              LDA & TMA Verified Housing Societies
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
              Explore master-planned communities with verified land records, carpeted roads, and easy installment plans.
            </p>
          </div>

          <button
            onClick={onOpenMap}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Explore Masterplan Maps</span>
          </button>
        </div>

        {/* Societies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {societies.map((soc) => {
            const socPlots = plots.filter(p => p.societyId === soc.id);
            const minPrice = socPlots.length > 0 
              ? Math.min(...socPlots.map(p => p.pricePKR))
              : 1500000;

            return (
              <div 
                key={soc.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Hero Image Header */}
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img 
                      src={soc.heroImage} 
                      alt={soc.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-xs flex items-center gap-1 border border-slate-700">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>{soc.approvalStatus.toUpperCase()}</span>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-md shadow-xs font-[Outfit]">
                      {soc.availablePlots} Plots Left
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 font-[Outfit] group-hover:text-amber-600 transition-colors">
                        {soc.name}
                      </h3>
                      <p className="text-slate-500 text-xs flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span>{soc.location}</span>
                      </p>
                    </div>

                    <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                      {soc.description}
                    </p>

                    {/* Amenities Tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {soc.amenities.slice(0, 3).map((amenity, i) => (
                        <span key={i} className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded border border-slate-200">
                          {amenity}
                        </span>
                      ))}
                      {soc.amenities.length > 3 && (
                        <span className="text-[10px] text-slate-500 font-semibold align-middle pt-0.5">
                          +{soc.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 pt-0 space-y-2">
                  <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-600">Starting From:</span>
                    <span className="text-xs font-black text-amber-900 font-[Outfit]">
                      PKR {(minPrice / 100000).toFixed(1)} Lakh
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectSociety(soc.id)}
                    className="w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>View Plot Masterplan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>


      {/* SECTION 2: INTERACTIVE INSTALLMENT & PAYMENT CALCULATOR WIDGET */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          
          {/* Subtle Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Calculator Controls */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Instant Installment Estimator</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black font-[Outfit]">
                  Calculate Your Plot Installment Plan
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  Adjust plot size and installment tenure to see instant down payment and monthly budget breakdowns.
                </p>
              </div>

              <div className="space-y-4">
                {/* Select Society */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Choose Housing Society</label>
                  <select
                    value={calcSocietyId}
                    onChange={e => setCalcSocietyId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                  >
                    {societies.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.location})</option>
                    ))}
                  </select>
                </div>

                {/* Plot Size Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Select Plot Size (Marla)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 5, 10, 20].map((marla) => (
                      <button
                        key={marla}
                        type="button"
                        onClick={() => setCalcMarla(marla)}
                        className={`py-2 rounded-xl text-xs font-extrabold transition-all border ${
                          calcMarla === marla
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {marla === 20 ? '1 Kanal' : `${marla} Marla`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Plan Tenure */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Payment Plan Duration</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[12, 24, 36, 48].map((months) => (
                      <button
                        key={months}
                        type="button"
                        onClick={() => setCalcTenureMonths(months)}
                        className={`py-2 rounded-xl text-xs font-extrabold transition-all border ${
                          calcTenureMonths === months
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {months / 12} {months === 12 ? 'Year' : 'Years'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Calculated Breakdown Display Card */}
            <div className="lg:col-span-6">
              <div className="bg-slate-800/90 border border-slate-700/90 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-5">
                
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase block">Official Rate Structure</span>
                    <h3 className="text-lg font-black font-[Outfit] text-white">
                      {calcMarla === 20 ? '1 Kanal' : `${calcMarla} Marla`} Plot Payment Schedule
                    </h3>
                  </div>

                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-extrabold px-2.5 py-1 rounded-md">
                    20% Down Payment
                  </span>
                </div>

                {/* Big Price Display */}
                <div className="bg-slate-900/90 p-4 rounded-xl border border-amber-500/30 text-center space-y-1">
                  <span className="text-xs text-slate-400 font-semibold">Total Estimated Plot Price</span>
                  <span className="text-3xl font-black font-[Outfit] text-amber-400 block">
                    PKR {calcTotalPrice.toLocaleString('en-PK')}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Rate: PKR {avgMarlaPrice.toLocaleString('en-PK')} / Marla
                  </span>
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
                    <span className="text-slate-300 font-medium">Initial Booking (20% Down Payment):</span>
                    <span className="font-extrabold text-amber-300 font-mono">
                      PKR {calcDownPayment.toLocaleString('en-PK')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
                    <span className="text-slate-300 font-medium">Monthly Installment ({calcTenureMonths} Months):</span>
                    <span className="font-extrabold text-emerald-400 font-mono">
                      PKR {calcMonthlyInstallment.toLocaleString('en-PK')} / mo
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
                    <span className="text-slate-300 font-medium">Bi-Annual Balloting Fee (10%):</span>
                    <span className="font-extrabold text-slate-200 font-mono">
                      PKR {calcBallotingFee.toLocaleString('en-PK')}
                    </span>
                  </div>
                </div>

                {/* Call To Action Buttons */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      const matchingPlot = availablePlotsList.find(p => p.sizeMarla === calcMarla) || availablePlotsList[0];
                      if (matchingPlot) {
                        onInitiateBooking({
                          plotId: matchingPlot.id,
                          title: `Plot ${matchingPlot.plotNumber}`,
                          price: calcTotalPrice,
                          downPayment: calcDownPayment,
                          societyName: selectedCalcSociety.name
                        });
                      } else {
                        onOpenMap();
                      }
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-xl shadow-lg text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Book Plot Online</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  <button
                    onClick={() => onOpenInquiry(undefined, availablePlotsList[0])}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Inquire Representative</span>
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>


      {/* SECTION 3: PLATFORM ADVANTAGES / WHY CHOOSE MANZILIQ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-300">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Built For Modern Real Estate</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-[Outfit] text-slate-900">
            Why Buyers & Society Owners Trust MANZILIQ
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Eliminating paper-file scams with digital masterplan maps, instant QR allotment deeds, and verified installment ledgers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-amber-400 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold font-[Outfit] text-slate-900">100% Registry & TMA Verified</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Every society plot listed is cross-checked with official Municipal and Development Authority records to guarantee genuine land titles.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-amber-400 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="text-lg font-bold font-[Outfit] text-slate-900">Interactive Georeferenced Maps</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Inspect exact plot blocks, boulevard width, corner locations, and park view availability in real time on vector masterplans.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-amber-400 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold font-[Outfit] text-slate-900">AI Valuation & Price Predictor</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Avoid overpaying or under-pricing with machine learning price estimates calibrated for nationwide real estate market trends.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-amber-400 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold font-[Outfit] text-slate-900">Instant PDF Allotment Deeds</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Upon successful down payment verification, generate official QR-coded allotment deeds, transfer letters, and agreement documents instantly.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-amber-400 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold font-[Outfit] text-slate-900">Digital Mobile Installment Ledger</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Track paid vs pending installments on your buyer dashboard. Pay upcoming dues directly via EasyPaisa, JazzCash, or online banking.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-amber-400 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="text-lg font-bold font-[Outfit] text-slate-900">Dealer CRM & Verified Agents</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Connect directly with verified licensed real estate dealers or manage customer leads via our built-in Kanban CRM board.
            </p>
          </div>

        </div>
      </section>


      {/* SECTION 4: HOW IT WORKS STEP-BY-STEP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">Simplified Digital Workflow</span>
              <h2 className="text-2xl sm:text-3xl font-black font-[Outfit] text-slate-900 mt-0.5">
                How MANZILIQ Works
              </h2>
            </div>

            {/* Toggle Switch: Buyer vs Dealer */}
            <div className="bg-slate-200 p-1 rounded-xl flex items-center text-xs font-bold">
              <button
                onClick={() => setHowItWorksUserType('buyer')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  howItWorksUserType === 'buyer'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-extrabold'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                For Plot Buyers
              </button>
              <button
                onClick={() => setHowItWorksUserType('dealer')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  howItWorksUserType === 'dealer'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-extrabold'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                For Societies & Dealers
              </button>
            </div>
          </div>

          {/* Workflow Steps Cards */}
          {howItWorksUserType === 'buyer' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 relative shadow-xs">
                <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center font-[Outfit]">
                  01
                </span>
                <h3 className="font-extrabold text-base text-slate-900 font-[Outfit]">Select Plot on Masterplan</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Browse housing society sectors on our vector map. Inspect plot dimensions, park-facing status, and boulevard width.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 relative shadow-xs">
                <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center font-[Outfit]">
                  02
                </span>
                <h3 className="font-extrabold text-base text-slate-900 font-[Outfit]">Verify AI Price Valuation</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Use our ML valuation tool to confirm fair market value per Marla based on verified benchmark sales.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 relative shadow-xs">
                <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center font-[Outfit]">
                  03
                </span>
                <h3 className="font-extrabold text-base text-slate-900 font-[Outfit]">Pay 20% Down Payment</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Submit online down payment securely using EasyPaisa, JazzCash, or bank wire transfer to reserve the plot block.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 relative shadow-xs">
                <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center font-[Outfit]">
                  04
                </span>
                <h3 className="font-extrabold text-base text-slate-900 font-[Outfit]">Download Allotment Deed</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Receive your official QR-verified PDF allotment letter and manage monthly installments from your buyer portal.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 relative shadow-xs">
                <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center font-[Outfit]">
                  01
                </span>
                <h3 className="font-extrabold text-base text-slate-900 font-[Outfit]">Upload Plot CSV Inventory</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bulk import society plot numbers, marla sizes, price lists, and sector coordinates in one click.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 relative shadow-xs">
                <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center font-[Outfit]">
                  02
                </span>
                <h3 className="font-extrabold text-base text-slate-900 font-[Outfit]">Publish Georeferenced Map</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Embed society layout maps so buyers can visually click plot blocks and inspect availability 24/7.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 relative shadow-xs">
                <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center font-[Outfit]">
                  03
                </span>
                <h3 className="font-extrabold text-base text-slate-900 font-[Outfit]">Manage CRM Leads</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Track buyer inquiries, site visits, and booking down payments on the interactive Kanban board.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 relative shadow-xs">
                <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center font-[Outfit]">
                  04
                </span>
                <h3 className="font-extrabold text-base text-slate-900 font-[Outfit]">Auto-Generate Deeds</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Issue legally stamped allotment and transfer letters with QR code security directly to buyers.
                </p>
              </div>
            </div>
          )}

        </div>
      </section>


      {/* SECTION 5: PAKISTAN REAL ESTATE MARKET INSIGHTS & INFRASTRUCTURE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-300">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                <span>Market Insights & Growth Drivers</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black font-[Outfit] text-slate-900">
                Pakistan Real Estate Market Growth
              </h2>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Pakistan's master-planned housing communities are experiencing significant growth driven by modern infrastructure, expressway networks, and gated lifestyle developments.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Kartarpur Corridor Link</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    +25% surge in commercial land interest driven by hospitality and tourism infrastructure.
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    <span>University & Medical Campus</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    High rental yields and capital appreciation near major transport & educational corridors.
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Zafarwal Dual Carriageway</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Improved connectivity reducing travel time to Lahore and Sialkot Airport.
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    <span>Digital Land Record Cadastre</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Punjab Land Records Authority (PLRA) computerization ensuring scam-free transfers.
                  </p>
                </div>
              </div>
            </div>

            {/* Growth Stat Banner */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl border border-slate-700 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">5-Year Capital Appreciation</span>
                  <span className="text-3xl font-black font-[Outfit] text-white block mt-0.5">+18.5% YoY</span>
                </div>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-md border border-emerald-500/30">
                  HIGH RETURN
                </span>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">
                Average plot values in top approved societies (such as Al-Rehman Garden & Royal Orchard Housing) have appreciated by over 80% since 2021.
              </p>

              <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Current Average Price / Marla:</span>
                <span className="font-bold text-amber-300 font-mono">PKR 550,000</span>
              </div>

              <button
                onClick={onOpenEstimator}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Check AI Price Estimate For Any Plot</span>
              </button>
            </div>

          </div>
        </div>
      </section>


      {/* SECTION 6: VERIFIED TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-300">
            <Quote className="w-3.5 h-3.5 text-amber-600" />
            <span>Community Feedback</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-[Outfit] text-slate-900">
            What Our Buyers & Society Partners Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-500">
                {'★'.repeat(5)}
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                "As an overseas Pakistani living in UAE, buying a 5 Marla plot in Al-Rehman Garden via MANZILIQ was seamless. I inspected the masterplan map online, paid down payment, and received my PDF allotment deed on WhatsApp!"
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120" 
                alt="Usman Bajwa" 
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div>
                <h4 className="font-bold text-xs text-slate-900">Usman Bajwa</h4>
                <p className="text-[10px] text-slate-500">Overseas Buyer (Plot A-08 Owner)</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-500">
                {'★'.repeat(5)}
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                "MANZILIQ digitized our entire society plot inventory. Buyers can now see available plot blocks in real time without visiting our office daily. It eliminated fake file duplication completely."
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120" 
                alt="Chaudhry Bilal" 
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div>
                <h4 className="font-bold text-xs text-slate-900">Chaudhry Bilal</h4>
                <p className="text-[10px] text-slate-500">Al-Rehman Garden Society Admin</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-500">
                {'★'.repeat(5)}
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                "The AI Valuation engine gives my property clients immediate confidence in current market rates per Marla. The lead CRM board helps our agency manage site visits effortlessly."
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120" 
                alt="Malik Hammad" 
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div>
                <h4 className="font-bold text-xs text-slate-900">Malik Hammad</h4>
                <p className="text-[10px] text-slate-500">Certified Real Estate Agent</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* SECTION 7: FREQUENTLY ASKED QUESTIONS (FAQ) ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1 rounded-full border border-slate-200">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-[Outfit] text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = expandedFaq === index;
            return (
              <div 
                key={index}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-2xs"
              >
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : index)}
                  className="w-full text-left p-4.5 font-bold text-sm text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="font-[Outfit]">{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-amber-600 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                </button>

                {isOpen && (
                  <div className="px-4.5 pb-4.5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>


      {/* SECTION 8: BOTTOM HIGH-CONVERTING CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <span className="bg-slate-950 text-amber-400 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              Pakistan Housing & Society Platform
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-[Outfit] leading-tight">
              Ready to Book Your Verified Plot?
            </h2>
            <p className="text-slate-900 text-xs sm:text-sm font-medium">
              Join thousands of buyers exploring georeferenced masterplans, easy installment schedules, and instant digital allotment deeds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenMap}
              className="bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold px-6 py-3.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Masterplan Map</span>
            </button>

            <button
              onClick={() => onOpenInquiry()}
              className="bg-white/90 hover:bg-white text-slate-950 font-extrabold px-5 py-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-sm"
            >
              <span>Contact Representative</span>
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};
