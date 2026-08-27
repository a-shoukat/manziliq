import React, { useState } from 'react';
import { NotificationItem } from '../../types';
import { 
  Bell, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Filter, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface BuyerNotificationsViewProps {
  notifications: NotificationItem[];
  onOpenDetailModal: (notification: NotificationItem) => void;
}

export const BuyerNotificationsView: React.FC<BuyerNotificationsViewProps> = ({
  notifications,
  onOpenDetailModal
}) => {
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'in_app' | 'sms' | 'email'>('all');

  const filteredNotifications = notifications.filter(n => {
    if (selectedChannel === 'all') return true;
    return n.channel === selectedChannel;
  });

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-emerald-800" />
            <span>3-Tier Notification Dispatch Inbox</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Simultaneous multi-channel notification engine (In-App notifications, SMS alerts, and official Email digests).
          </p>
        </div>

        {/* Channel Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setSelectedChannel('all')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              selectedChannel === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Channels ({notifications.length})
          </button>
          <button
            onClick={() => setSelectedChannel('in_app')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              selectedChannel === 'in_app' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🔔 In-App
          </button>
          <button
            onClick={() => setSelectedChannel('sms')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              selectedChannel === 'sms' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📱 SMS
          </button>
          <button
            onClick={() => setSelectedChannel('email')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              selectedChannel === 'email' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ✉️ Email
          </button>
        </div>
      </div>

      {/* Explanatory Info Card */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 text-xs text-emerald-950 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
          <MessageSquare className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold">Real-time Multi-Channel Synchronization:</span> Whenever a booking advances a pipeline stage, an installment is paid, or a surcharge is triggered, Manziliq dispatches to all 3 channels. <strong>Click any item below to preview how it renders across SMS, In-App, and Email clients!</strong>
        </div>
      </div>

      {/* Notification Items List */}
      <div className="space-y-3">
        {filteredNotifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => onOpenDetailModal(notif)}
            className={`p-5 rounded-3xl border transition cursor-pointer flex items-start justify-between gap-4 hover:shadow-md ${
              !notif.read 
                ? 'bg-white border-emerald-300 ring-1 ring-emerald-400 shadow-xs' 
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                notif.channel === 'sms' ? 'bg-amber-100 text-amber-800' :
                notif.channel === 'email' ? 'bg-blue-100 text-blue-800' :
                'bg-emerald-100 text-emerald-800'
              }`}>
                {notif.channel === 'sms' ? <Smartphone className="w-5 h-5" /> :
                 notif.channel === 'email' ? <Mail className="w-5 h-5" /> :
                 <Bell className="w-5 h-5" />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{notif.title}</h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {notif.channel.replace('_', ' ')}
                  </span>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                  {notif.message}
                </p>

                <div className="text-[11px] text-slate-400 font-mono pt-1">
                  Dispatched at: {notif.date}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 shrink-0 self-center">
              <span>Preview 3-Tier</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
