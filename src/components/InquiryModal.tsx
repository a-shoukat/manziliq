import React, { useState } from 'react';
import { Property, Plot } from '../types';
import { X, Send, CheckCircle2, MessageSquare } from 'lucide-react';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property;
  plot?: Plot;
  onSubmitInquiry: (inquiryData: { name: string; phone: string; email: string; message: string }) => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  isOpen,
  onClose,
  property,
  plot,
  onSubmitInquiry
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+92 300 ');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('I am interested in this plot/property and would like details regarding installment terms, possession date, and site visit.');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitInquiry({ name, phone, email, message });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  const title = property ? property.title : plot ? `Plot ${plot.plotNumber} (${plot.societyName})` : 'Property Inquiry';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-1 rounded-lg">
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Direct Inquiry</span>
            </div>

            <h3 className="text-xl font-bold font-[Outfit]">Send Inquiry to Society / Agent</h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{title}</p>

            <form onSubmit={handleSubmit} className="space-y-3 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Asad Malik"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="asad@gmail.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Message / Question</label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all text-xs"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry to Agent</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-lg font-bold text-white">Inquiry Sent Successfully!</h4>
            <p className="text-xs text-slate-400">The assigned society dealer will contact you on {phone} shortly.</p>
          </div>
        )}

      </div>
    </div>
  );
};
