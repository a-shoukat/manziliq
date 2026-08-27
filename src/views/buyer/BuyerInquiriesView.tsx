import React, { useState } from 'react';
import { User } from '../../types';
import { 
  MessageSquare, 
  Calendar, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Building2, 
  UserCheck, 
  ArrowRight 
} from 'lucide-react';

interface BuyerInquiriesViewProps {
  currentUser: User;
  onNavigate: (route: string) => void;
}

export const BuyerInquiriesView: React.FC<BuyerInquiriesViewProps> = ({
  currentUser,
  onNavigate
}) => {
  const [inquiries, setInquiries] = useState([
    {
      id: 'inq-1',
      propertyTitle: '5 Marla Luxury Spanish Villa',
      societyName: 'Al-Rehman Garden Housing Society',
      location: 'Sector A, Main Boulevard, Lahore',
      dealerName: 'Chaudhry Tariq Real Estate',
      dealerPhone: '+92 300 9847201',
      date: '2026-08-18',
      visitDate: '2026-08-25',
      visitTime: '04:00 PM',
      status: 'Confirmed Site Visit',
      message: 'I am interested in this property and would like to confirm availability and schedule a physical inspection with title registry review.',
      dealerReply: 'Visit confirmed. Our senior agent Bilal Tariq will meet you at Society Reception Gate 1 with all original registry maps.'
    },
    {
      id: 'inq-2',
      propertyTitle: '10 Marla Corner Executive Residential Plot',
      societyName: 'Royal Orchard Society',
      location: 'Block B, Near Central Park, Islamabad',
      dealerName: 'Bismillah Estate & Builders',
      dealerPhone: '+92 301 7766554',
      date: '2026-08-16',
      visitDate: '2026-08-22',
      visitTime: '11:30 AM',
      status: 'Awaiting Dealer Schedule',
      message: 'Need clarification on corner plot possession timeline and development charges before submitting token advance.',
      dealerReply: 'Under review by our inventory team. Calling you shortly.'
    }
  ]);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-emerald-800" />
            <span>Property Inquiries & Scheduled Site Visits</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Direct communication threads with verified licensed real estate dealers and physical inspection appointments.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/marketplace')}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          + Send New Inquiry
        </button>
      </div>

      {/* Inquiries Cards */}
      <div className="space-y-6">
        {inquiries.map((inq) => (
          <div
            key={inq.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5"
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Target Listing
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{inq.propertyTitle}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{inq.location}</span>
                </p>
              </div>

              <span className={`text-xs font-bold px-3 py-1 rounded-full self-start sm:self-center ${
                inq.status.includes('Confirmed') 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {inq.status}
              </span>
            </div>

            {/* Visit Details Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div className="space-y-1">
                <div className="text-slate-400 font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Scheduled Walkthrough Inspection:</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {inq.visitDate} at {inq.visitTime}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-400 font-semibold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Assigned Authorized Dealer:</span>
                </div>
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>{inq.dealerName}</span>
                  <a href={`tel:${inq.dealerPhone}`} className="text-emerald-700 hover:underline text-xs">
                    ({inq.dealerPhone})
                  </a>
                </div>
              </div>
            </div>

            {/* Message & Reply Thread */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-700">Your Inquiry Message:</div>
                <p className="text-slate-600 leading-relaxed">{inq.message}</p>
              </div>

              {inq.dealerReply && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Dealer Response:</span>
                  </div>
                  <p className="text-emerald-900 leading-relaxed">{inq.dealerReply}</p>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
