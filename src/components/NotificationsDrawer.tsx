import React from 'react';
import { NotificationItem } from '../types';
import { X, Bell, Check, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-md h-full shadow-2xl flex flex-col text-white border-l border-slate-800">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-lg font-[Outfit]">Notifications Center</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-amber-400 hover:underline"
            >
              Mark all read
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Bell className="w-12 h-12 mx-auto stroke-1 text-slate-600 mb-2" />
              <p className="text-sm font-semibold">No notifications yet</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={`p-3 rounded-xl border transition-all ${
                  n.read ? 'bg-slate-800/40 border-slate-800 opacity-75' : 'bg-slate-800 border-amber-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-xs text-amber-400">{n.title}</span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {n.date}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{n.message}</p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
