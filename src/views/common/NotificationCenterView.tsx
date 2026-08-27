import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Smartphone, 
  Mail, 
  Zap, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Filter, 
  Search, 
  CheckCheck, 
  Play, 
  RotateCw, 
  Shield, 
  Settings2, 
  SmartphoneNfc, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileText,
  CreditCard,
  Building2,
  Users
} from 'lucide-react';
import { NotificationItem, NotificationDeliveryLog, NotificationPreferences, DeviceTokenRegistration } from '../../types/notifications';
import { notificationService } from '../../services/notificationService';

interface NotificationCenterViewProps {
  notifications: NotificationItem[];
  currentUserRole: string;
  currentUserId?: string;
  onOpenDetailModal: (notification: NotificationItem) => void;
  onNavigateToEntity?: (route: string) => void;
  onRefreshNotifications?: () => void;
  installments?: any[];
  dealerLots?: any[];
}

export const NotificationCenterView: React.FC<NotificationCenterViewProps> = ({
  notifications,
  currentUserRole,
  currentUserId = 'u-buyer-1',
  onOpenDetailModal,
  onNavigateToEntity,
  onRefreshNotifications,
  installments = [],
  dealerLots = []
}) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'scheduler' | 'preferences' | 'fcm' | 'telemetry'>('inbox');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // Scheduler State
  const [schedulerRunning, setSchedulerRunning] = useState(false);
  const [schedulerResult, setSchedulerResult] = useState<{
    remindersSent: number;
    overdueSent: number;
    lotAlertsSent: number;
    duplicatePreventedCount: number;
    runSummary: string;
  } | null>(null);

  // Preferences State
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    userId: currentUserId,
    pushNotifications: true,
    smsNotifications: true,
    emailNotifications: true,
    inAppNotifications: true,
    installmentReminders: true,
    marketingUpdates: false,
    dealUpdates: true,
    documentAlerts: true,
    securityAlerts: true
  });
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState(false);

  // FCM Tokens State
  const [registeredTokens, setRegisteredTokens] = useState<DeviceTokenRegistration[]>([]);
  const [newTokenString, setNewTokenString] = useState('');
  const [newPlatform, setNewPlatform] = useState<'web' | 'android' | 'ios'>('android');
  const [newDeviceModel, setNewDeviceModel] = useState('Flutter Mobile Client');

  // Telemetry Logs State
  const [deliveryLogs, setDeliveryLogs] = useState<NotificationDeliveryLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Load preferences and initial tokens
  useEffect(() => {
    notificationService.fetchPreferences(currentUserId).then(setPreferences);
    loadDeliveryLogs();
  }, [currentUserId]);

  const loadDeliveryLogs = async () => {
    setLoadingLogs(true);
    const logs = await notificationService.fetchDeliveryLogs();
    setDeliveryLogs(logs);
    setLoadingLogs(false);
  };

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    await notificationService.markAllAsRead(currentUserId);
    if (onRefreshNotifications) onRefreshNotifications();
    setTimeout(() => setIsMarkingAll(false), 400);
  };

  const handleRunScheduler = async () => {
    setSchedulerRunning(true);
    const res = await notificationService.runScheduledChecks(installments, dealerLots);
    setSchedulerResult(res);
    if (onRefreshNotifications) onRefreshNotifications();
    await loadDeliveryLogs();
    setSchedulerRunning(false);
  };

  const handleSavePreferences = async (updated: Partial<NotificationPreferences>) => {
    const next = { ...preferences, ...updated };
    setPreferences(next);
    setPrefSaving(true);
    await notificationService.updatePreferences(currentUserId, next);
    setPrefSaving(false);
    setPrefSuccess(true);
    setTimeout(() => setPrefSuccess(false), 2000);
  };

  const handleRegisterCustomToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenString.trim()) return;
    const reg = await notificationService.registerFcmToken(
      currentUserId,
      newTokenString.trim(),
      newPlatform,
      newDeviceModel
    );
    if (reg) {
      setRegisteredTokens(prev => [reg, ...prev]);
      setNewTokenString('');
    }
  };

  // Filtered Notifications for Inbox
  const filteredNotifications = notifications.filter(n => {
    if (selectedChannel !== 'all') {
      if (selectedChannel === 'sms' && n.channel !== 'sms' && !n.channelsSent?.includes('sms')) return false;
      if (selectedChannel === 'email' && n.channel !== 'email' && !n.channelsSent?.includes('email')) return false;
      if (selectedChannel === 'push' && n.channel !== 'push' && !n.channelsSent?.includes('push')) return false;
      if (selectedChannel === 'in_app' && n.channel !== 'in_app' && !n.channelsSent?.includes('in_app')) return false;
    }
    if (selectedCategory !== 'all' && n.type !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchMsg = n.message.toLowerCase().includes(q);
      const matchRef = n.referenceId?.toLowerCase().includes(q);
      return matchTitle || matchMsg || matchRef;
    }
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Module 9 · Centralized Notification Service
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Multi-Channel Backend Orchestration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Bell className="w-8 h-8 text-emerald-800" />
            <span>Notification & Communication Command Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Unified delivery orchestration for In-App alerts, Firebase Cloud Messaging (FCM) push, Pakistan SMS gateways, and branded SMTP email.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleMarkAllRead}
            disabled={isMarkingAll || unreadCount === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-emerald-700" />
            <span>{isMarkingAll ? 'Marking...' : `Mark All as Read (${unreadCount})`}</span>
          </button>

          <button
            onClick={handleRunScheduler}
            disabled={schedulerRunning}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 shadow-xs transition cursor-pointer disabled:opacity-60"
          >
            <Play className={`w-4 h-4 text-emerald-300 ${schedulerRunning ? 'animate-spin' : ''}`} />
            <span>{schedulerRunning ? 'Running Sweeps...' : 'Run Automated 3-Day Reminders'}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl px-4 pt-2 gap-2 overflow-x-auto shadow-xs">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'inbox'
              ? 'border-emerald-800 text-emerald-800 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notification Inbox</span>
          {unreadCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-[10px] font-extrabold bg-emerald-800 text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('scheduler')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'scheduler'
              ? 'border-emerald-800 text-emerald-800 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Background Scheduler</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'preferences'
              ? 'border-emerald-800 text-emerald-800 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Settings2 className="w-4 h-4 text-indigo-600" />
          <span>User Preferences</span>
        </button>

        <button
          onClick={() => setActiveTab('fcm')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'fcm'
              ? 'border-emerald-800 text-emerald-800 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <SmartphoneNfc className="w-4 h-4 text-rose-600" />
          <span>FCM Device Tokens</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('telemetry');
            loadDeliveryLogs();
          }}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'telemetry'
              ? 'border-emerald-800 text-emerald-800 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Delivery Telemetry & Logs</span>
        </button>
      </div>

      {/* TAB 1: INBOX */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          {/* Channel and Category Filters + Search */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search notifications, plots, reference numbers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-emerald-800"
              />
            </div>

            {/* Channel Filters */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {[
                { id: 'all', label: 'All Channels', icon: null },
                { id: 'in_app', label: 'In-App', icon: Bell },
                { id: 'push', label: 'FCM Push', icon: Zap },
                { id: 'sms', label: 'SMS', icon: Smartphone },
                { id: 'email', label: 'Email', icon: Mail }
              ].map(ch => {
                const Icon = ch.icon;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setSelectedChannel(ch.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      selectedChannel === ch.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{ch.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-emerald-800"
            >
              <option value="all">All Event Types</option>
              <option value="booking">Bookings</option>
              <option value="payment">Payments</option>
              <option value="installment">Installments</option>
              <option value="document">Documents</option>
              <option value="deal_stage">Deal Pipeline</option>
              <option value="lot_assignment">Dealer Lots</option>
              <option value="dispute">Disputes & Security</option>
            </select>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No Notifications Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No notification records match your selected filters. Trigger actions or run the automated scheduler above!
                </p>
              </div>
            ) : (
              filteredNotifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-4 sm:p-5 rounded-3xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md ${
                    !notif.read
                      ? 'bg-white border-emerald-300 ring-1 ring-emerald-400 shadow-xs'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      notif.type === 'payment' || notif.type === 'installment' ? 'bg-amber-100 text-amber-800' :
                      notif.type === 'document' ? 'bg-blue-100 text-blue-800' :
                      notif.type === 'dispute' ? 'bg-rose-100 text-rose-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {notif.type === 'payment' || notif.type === 'installment' ? <CreditCard className="w-5 h-5" /> :
                       notif.type === 'document' ? <FileText className="w-5 h-5" /> :
                       notif.type === 'dispute' ? <Shield className="w-5 h-5" /> :
                       <Bell className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900">{notif.title}</h3>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {notif.type.replace('_', ' ')}
                        </span>
                        {!notif.read && (
                          <span className="px-2 py-0.5 text-[9px] font-extrabold bg-emerald-600 text-white rounded-full">
                            UNREAD
                          </span>
                        )}
                        {notif.eventKey && (
                          <span className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {notif.eventKey}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                        <span>{notif.date || notif.createdAt}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1 text-[10px]">
                          <span className="text-slate-500 font-sans font-bold">Channels:</span>
                          {(notif.channelsSent || ['in_app', 'push', 'sms', 'email']).map(ch => (
                            <span key={ch} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold uppercase">
                              {ch}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {notif.deepLinkRoute && onNavigateToEntity && (
                      <button
                        onClick={() => onNavigateToEntity(notif.deepLinkRoute!)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                      >
                        <span>Open Screen</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </button>
                    )}

                    <button
                      onClick={() => onOpenDetailModal(notif)}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
                    >
                      <span>Multi-Channel Inspector</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BACKGROUND SCHEDULER */}
      {activeTab === 'scheduler' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Background Reminder & Surcharge Engine</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated daemon sweeps for 3-day installment due dates, overdue notices with 2.5% surcharge calculations, and lot expirations.
                </p>
              </div>

              <button
                onClick={handleRunScheduler}
                disabled={schedulerRunning}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 shadow-sm transition cursor-pointer disabled:opacity-60"
              >
                <Play className={`w-4 h-4 text-emerald-300 ${schedulerRunning ? 'animate-spin' : ''}`} />
                <span>{schedulerRunning ? 'Executing Sweep...' : 'Trigger Scheduled Sweep Now'}</span>
              </button>
            </div>

            {/* Sweep Rules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-900 uppercase">1. 3-Day Reminders</span>
                  <Clock className="w-4 h-4 text-amber-700" />
                </div>
                <p className="text-xs text-amber-950 leading-relaxed">
                  Scans all pending installments with due date within 3 days (e.g. 72h window) and triggers multi-channel dispatch with eventKey deduplication.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-rose-900 uppercase">2. Overdue Surcharge Alerts</span>
                  <AlertCircle className="w-4 h-4 text-rose-700" />
                </div>
                <p className="text-xs text-rose-950 leading-relaxed">
                  Evaluates unpaid installments past due date, calculates 2.5% society late surcharge, and dispatches urgent warning notices.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-indigo-900 uppercase">3. Dealer Lot Expiry</span>
                  <Building2 className="w-4 h-4 text-indigo-700" />
                </div>
                <p className="text-xs text-indigo-950 leading-relaxed">
                  Warns authorized dealers 7 days before exclusive lot reservation windows close, prompting inventory renewal or return to pool.
                </p>
              </div>
            </div>

            {/* Execution Result Log */}
            {schedulerResult && (
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                  <span>Scheduler Execution Log:</span>
                  <span>Completed at {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-2">
                  <div className="bg-slate-800 p-3 rounded-xl">
                    <div className="text-xl font-bold text-amber-400">{schedulerResult.remindersSent}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">3-Day Reminders Sent</div>
                  </div>
                  <div className="bg-slate-800 p-3 rounded-xl">
                    <div className="text-xl font-bold text-rose-400">{schedulerResult.overdueSent}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Overdue Notices Sent</div>
                  </div>
                  <div className="bg-slate-800 p-3 rounded-xl">
                    <div className="text-xl font-bold text-indigo-400">{schedulerResult.lotAlertsSent}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Lot Alerts Sent</div>
                  </div>
                  <div className="bg-slate-800 p-3 rounded-xl">
                    <div className="text-xl font-bold text-emerald-400">{schedulerResult.duplicatePreventedCount}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Duplicates Prevented</div>
                  </div>
                </div>
                <p className="text-xs text-slate-300 font-mono pt-2">{schedulerResult.runSummary}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: USER PREFERENCES */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Communication & Channel Preferences</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure delivery channels and alert categories for user account: <strong className="text-slate-800">{currentUserId}</strong>
                </p>
              </div>

              {prefSuccess && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Preferences Saved Successfully!
                </span>
              )}
            </div>

            {/* Delivery Channels Toggle */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Delivery Channels</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">FCM Push Notifications</div>
                      <div className="text-[11px] text-slate-500">Real-time alerts to mobile and web clients</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.pushNotifications}
                    onChange={(e) => handleSavePreferences({ pushNotifications: e.target.checked })}
                    className="w-5 h-5 accent-emerald-800 rounded cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">SMS Alerts (Pakistan Shortcode)</div>
                      <div className="text-[11px] text-slate-500">Critical OTPs, token confirmation, installment dues</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.smsNotifications}
                    onChange={(e) => handleSavePreferences({ smsNotifications: e.target.checked })}
                    className="w-5 h-5 accent-emerald-800 rounded cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Official Email Digests</div>
                      <div className="text-[11px] text-slate-500">Payment receipts, allotment letters, legal summaries</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={(e) => handleSavePreferences({ emailNotifications: e.target.checked })}
                    className="w-5 h-5 accent-emerald-800 rounded cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">In-App Notification Center</div>
                      <div className="text-[11px] text-slate-500">Persistent notification tray inside web and mobile apps</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.inAppNotifications}
                    onChange={(e) => handleSavePreferences({ inAppNotifications: e.target.checked })}
                    className="w-5 h-5 accent-emerald-800 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Notification Topics */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Topic Subscriptions</h4>

              <div className="space-y-3">
                {[
                  { key: 'installmentReminders', title: 'Installment Dues & Surcharge Alerts', desc: 'Reminders 3 days before installment due dates and late fee calculations' },
                  { key: 'dealUpdates', title: 'Deal Pipeline Stage Transitions', desc: 'Updates whenever a plot booking advances across the 6 deal stages' },
                  { key: 'documentAlerts', title: 'Document Generation & Locker Updates', desc: 'Allotment letters, payment receipts, NOC issuance' },
                  { key: 'marketingUpdates', title: 'Society Launches & Promotional Discounts', desc: 'New master plan launches, commercial plot lot releases' },
                  { key: 'securityAlerts', title: 'Security & Title Dispute Alerts (Mandatory)', desc: 'Account logins, dispute lock alerts, verification milestones', locked: true }
                ].map(item => (
                  <div key={item.key} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500">{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      disabled={item.locked}
                      checked={item.locked ? true : (preferences as any)[item.key]}
                      onChange={(e) => handleSavePreferences({ [item.key]: e.target.checked })}
                      className="w-4 h-4 accent-emerald-800 rounded cursor-pointer disabled:opacity-50"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FCM DEVICE TOKENS */}
      {activeTab === 'fcm' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Firebase Cloud Messaging Device Registry</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage registered device FCM push tokens for multi-device delivery (Web, Android Flutter, iOS).
              </p>
            </div>

            {/* Register New Test Token Form */}
            <form onSubmit={handleRegisterCustomToken} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900">Register Device / Simulator Token</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Enter FCM Device Token string..."
                  value={newTokenString}
                  onChange={(e) => setNewTokenString(e.target.value)}
                  className="sm:col-span-2 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-emerald-800"
                />
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value as any)}
                  className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-700"
                >
                  <option value="android">Android (Flutter)</option>
                  <option value="ios">iOS (Apple)</option>
                  <option value="web">Web Browser</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newTokenString.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  Register FCM Token
                </button>
              </div>
            </form>

            {/* Device Token Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase text-slate-400">Registered Endpoints</h4>
              
              <div className="space-y-2">
                {[
                  { id: 'tok-1', model: 'Samsung Galaxy S24 Ultra', platform: 'android', token: 'fcm_tok_android_flutter_samsung_s24_88ef', active: 'Active (2 mins ago)' },
                  { id: 'tok-2', model: 'Chrome on macOS (Web Client)', platform: 'web', token: 'fcm_tok_web_chrome_buyer_pk_99a8b7c6d5', active: 'Active (Now)' },
                  ...registeredTokens.map(t => ({ id: t.id, model: t.deviceModel || 'Registered Device', platform: t.platform, token: t.token, active: 'Just Registered' }))
                ].map(dev => (
                  <div key={dev.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{dev.model}</span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {dev.platform}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 truncate max-w-md">{dev.token}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-emerald-700">{dev.active}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TELEMETRY & DELIVERY LOGS */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Multi-Channel Delivery Telemetry</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audit trail of all SMS gateway dispatches, SMTP mail handshakes, and FCM pushes with latency tracking.
                </p>
              </div>

              <button
                onClick={loadDeliveryLogs}
                disabled={loadingLogs}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                <span>Refresh Logs</span>
              </button>
            </div>

            {/* Delivery Logs Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-extrabold uppercase text-[10px]">
                    <th className="p-3">Time</th>
                    <th className="p-3">Channel</th>
                    <th className="p-3">Recipient</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Provider Response / Carrier Log</th>
                    <th className="p-3 text-right">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deliveryLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No delivery logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    deliveryLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                            log.channel === 'sms' ? 'bg-amber-100 text-amber-900' :
                            log.channel === 'email' ? 'bg-blue-100 text-blue-900' :
                            log.channel === 'push' ? 'bg-indigo-100 text-indigo-900' :
                            'bg-emerald-100 text-emerald-900'
                          }`}>
                            {log.channel}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-800 whitespace-nowrap">
                          {log.recipient}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-600 text-[11px] max-w-xs truncate">
                          {log.providerResponse || 'DISPATCH_OK'}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-500">
                          {log.durationMs || 15}ms
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
