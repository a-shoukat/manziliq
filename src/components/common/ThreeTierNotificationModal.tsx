import React, { useState } from 'react';
import { NotificationItem } from '../../types';
import { 
  X, 
  Bell, 
  Smartphone, 
  Mail, 
  Zap,
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  ShieldAlert,
  Send,
  Building2,
  Copy,
  Check,
  ExternalLink,
  RotateCw,
  Clock,
  Layers,
  FileText
} from 'lucide-react';

interface ThreeTierNotificationModalProps {
  notification: NotificationItem | null;
  onClose: () => void;
  onNavigateToEntity?: (route: string) => void;
  onRetry?: (notificationId: string) => void;
}

export const ThreeTierNotificationModal: React.FC<ThreeTierNotificationModalProps> = ({
  notification,
  onClose,
  onNavigateToEntity,
  onRetry
}) => {
  const [activeTab, setActiveTab] = useState<'in_app' | 'fcm' | 'sms' | 'email' | 'telemetry'>('in_app');
  const [copied, setCopied] = useState(false);
  const [retrying, setRetrying] = useState(false);

  if (!notification) return null;

  const handleCopySMS = () => {
    if (notification.smsPreview) {
      navigator.clipboard.writeText(notification.smsPreview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRetryClick = async () => {
    if (onRetry) {
      setRetrying(true);
      await onRetry(notification.id);
      setTimeout(() => setRetrying(false), 600);
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'payment':
      case 'installment':
        return <CreditCard className="w-5 h-5 text-amber-600" />;
      case 'dispute':
        return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      case 'verification':
        return <CheckCircle2 className="w-5 h-5 text-purple-600" />;
      case 'document':
        return <FileText className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
              {getIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Multi-Channel Notification Dispatcher
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                  4-Channel Active
                </span>
                {notification.eventKey && (
                  <span className="text-[9px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                    Key: {notification.eventKey}
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate max-w-md mt-0.5">
                {notification.title}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Tier Channel Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-3 pt-2 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('in_app')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'in_app'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/70 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>In-App</span>
          </button>

          <button
            onClick={() => setActiveTab('fcm')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'fcm'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/70 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>FCM Push</span>
          </button>

          <button
            onClick={() => setActiveTab('sms')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'sms'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/70 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
            <span>SMS Gateway</span>
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'email'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/70 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-blue-500" />
            <span>SMTP Email</span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'telemetry'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/70 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Delivery Logs</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50 space-y-4">
          
          {/* Tab 1: In-App Alert */}
          {activeTab === 'in_app' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Timestamp: {notification.date || notification.createdAt}</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {notification.type.toUpperCase()}
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">{notification.title}</h4>
                <p className="text-sm text-slate-700 leading-relaxed">{notification.message}</p>
                
                {notification.deepLinkRoute && onNavigateToEntity && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Deep Link Target:</span>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToEntity(notification.deepLinkRoute!);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition cursor-pointer"
                    >
                      <span>Open Linked Screen</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950">
                <strong>In-App Dispatch:</strong> Stored persistently in database and pushed in real-time to active sessions with badge counter synchronization.
              </div>
            </div>
          )}

          {/* Tab 2: FCM Push Notification Preview */}
          {activeTab === 'fcm' && (
            <div className="space-y-4">
              <div className="max-w-md mx-auto bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-800 text-white space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold text-white">MANZILIQ Smart Real Estate</span>
                  </div>
                  <span>Just now</span>
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-sm text-amber-300">{notification.fcmPayload?.title || notification.title}</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">{notification.fcmPayload?.body || notification.message}</p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Channel: High Priority FCM Push</span>
                  {notification.deepLinkRoute && (
                    <span className="text-amber-400 font-mono">Route: {notification.deepLinkRoute}</span>
                  )}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-800">FCM Data Payload (JSON for Flutter & Web):</div>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
{JSON.stringify({
  notification: {
    title: notification.fcmPayload?.title || notification.title,
    body: notification.fcmPayload?.body || notification.message
  },
  data: {
    type: notification.type,
    referenceId: notification.referenceId || '',
    route: notification.deepLinkRoute || '/buyer/notifications',
    notificationId: notification.id
  }
}, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Tab 3: Simulated SMS */}
          {activeTab === 'sms' && (
            <div className="space-y-4">
              <div className="max-w-md mx-auto bg-slate-900 rounded-3xl p-4 shadow-xl border-4 border-slate-800 text-white">
                <div className="text-center text-[10px] text-slate-400 font-semibold mb-3">
                  MANZILIQ TELCO GATEWAY: 8440
                </div>

                <div className="bg-slate-800/90 rounded-2xl p-4 space-y-2 border border-slate-700">
                  <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold">
                    <span>MANZILIQ-OFFICIAL</span>
                    <span>Just Now</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-mono">
                    {notification.smsPreview || `[MANZILIQ] ${notification.title}: ${notification.message} - Login: https://manziliq.pk`}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 max-w-md mx-auto">
                <span>Characters: {notification.smsPreview?.length || 140}/160 (Single SMS Part)</span>
                <button
                  onClick={handleCopySMS}
                  className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy SMS Text'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 4: Simulated Branded Email */}
          {activeTab === 'email' && (
            <div className="space-y-3">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
                {/* Email Header */}
                <div className="bg-slate-100 p-3.5 border-b border-slate-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500 w-16">Subject:</span>
                    <span className="font-bold text-slate-900">{notification.emailPreview?.subject || notification.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-bold text-slate-500 w-16">From:</span>
                    <span>MANZILIQ Smart Housing &lt;notifications@manziliq.pk&gt;</span>
                  </div>
                </div>

                {/* Email Body */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="font-extrabold text-slate-900 text-sm tracking-tight">MANZILIQ HOUSING CORE</div>
                    <span className="text-[10px] text-slate-400">Official Communication</span>
                  </div>

                  <div className="text-slate-800 text-xs leading-relaxed whitespace-pre-line">
                    {notification.emailPreview?.body || notification.message}
                  </div>

                  <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
                    © 2026 MANZILIQ Smart Real Estate Platform. Unified Housing Society Management, Pakistan.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Delivery Logs & Telemetry */}
          {activeTab === 'telemetry' && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Delivery Channels Attempted</span>
                  <span className="text-[11px] font-mono text-slate-500">ID: {notification.id}</span>
                </div>

                <div className="space-y-2">
                  {(notification.deliveryLogs && notification.deliveryLogs.length > 0) ? (
                    notification.deliveryLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                              {log.channel}
                            </span>
                            <span className="font-semibold text-slate-800">{log.recipient}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono">{log.providerResponse}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            log.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {log.status.toUpperCase()}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-1">{log.durationMs || 25}ms</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                      Dispatched across: In-App, FCM Push, SMS, and Email. Status: {notification.status}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
          <button
            onClick={handleRetryClick}
            disabled={retrying}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
            <span>{retrying ? 'Retrying Dispatch...' : 'Retry Dispatch'}</span>
          </button>

          <div className="flex items-center gap-2">
            {notification.deepLinkRoute && onNavigateToEntity && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToEntity(notification.deepLinkRoute!);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition shadow-xs cursor-pointer"
              >
                Go to Entity Screen
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
