import React from 'react';
import { Zap, X, ArrowRight, ExternalLink } from 'lucide-react';
import { NotificationItem } from '../../types';

interface PushNotificationToastProps {
  notification: NotificationItem | null;
  onDismiss: () => void;
  onOpen: (notification: NotificationItem) => void;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({
  notification,
  onDismiss,
  onOpen
}) => {
  if (!notification) return null;

  return (
    <div className="fixed top-5 right-5 z-50 max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700/80 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400 mt-0.5">
            <Zap className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                FCM Push Alert
              </span>
              <span className="text-[10px] text-slate-400">Just now</span>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
              {notification.fcmPayload?.title || notification.title}
            </h4>

            <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
              {notification.fcmPayload?.body || notification.message}
            </p>

            <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => onOpen(notification)}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {notification.deepLinkRoute && (
                <span className="text-[10px] text-slate-400 font-mono ml-auto">
                  {notification.deepLinkRoute}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
