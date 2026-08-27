import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { 
  User as UserIcon, 
  Settings, 
  ShieldCheck, 
  Building2, 
  Briefcase, 
  Heart, 
  Bell, 
  Lock, 
  Save, 
  CheckCircle2, 
  Phone, 
  Mail, 
  CreditCard, 
  MapPin, 
  Smartphone, 
  Globe, 
  FileText,
  Key,
  Shield
} from 'lucide-react';

export interface ProfileSettingsViewProps {
  currentUser: User;
  onUpdateUser: (updated: Partial<User>) => void;
  triggerToast: (msg: string) => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  currentUser,
  onUpdateUser,
  triggerToast
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');

  // Universal fields
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [cnic, setCnic] = useState(currentUser.cnic || '34501-1234567-1');
  const [address, setAddress] = useState('Circular Avenue, Lahore City');

  // Role-specific fields
  // Society Admin fields
  const [societyName, setSocietyName] = useState(currentUser.societyName || 'Al-Rehman Garden Phase 1');
  const [nocRegNumber, setNocRegNumber] = useState('TMA-NRW-2024-889');
  const [secpNumber, setSecpNumber] = useState('SECP-0091823-PK');
  const [totalAcreage, setTotalAcreage] = useState(120);
  const [escrowBank, setEscrowBank] = useState('Meezan Bank Ltd - Main Branch (Acc: 0109-8827361)');

  // Dealer fields
  const [agencyName, setAgencyName] = useState('Al-Madina Estate & Marketing Advisors');
  const [dealerLicense, setDealerLicense] = useState(currentUser.licenseNo || 'PB-ET-RE-2024-771');
  const [serviceAreas, setServiceAreas] = useState('Lahore, Rawalpindi, Islamabad');
  const [commissionRate, setCommissionRate] = useState(2.0);

  // Customer/Buyer fields
  const [investorType, setInvestorType] = useState('Overseas Pakistani Investor');
  const [budgetRange, setBudgetRange] = useState('PKR 2.5M - 10M');
  const [preferredSizes, setPreferredSizes] = useState('5 Marla, 10 Marla');
  const [nicopPassport, setNicopPassport] = useState('NICOP-88271004-9');

  // Settings tab state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [currencyFormat, setCurrencyFormat] = useState('lakh_crore');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Accent styling based on role
  const role = currentUser.role;
  const roleStyles = {
    super_admin: {
      accent: 'indigo',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      tabActive: 'border-indigo-600 text-indigo-700',
      ring: 'focus:border-indigo-500 focus:ring-indigo-500/20'
    },
    society_admin: {
      accent: 'emerald',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      tabActive: 'border-emerald-600 text-emerald-700',
      ring: 'focus:border-emerald-500 focus:ring-emerald-500/20'
    },
    dealer: {
      accent: 'teal',
      badge: 'bg-teal-50 text-teal-700 border-teal-200',
      btn: 'bg-teal-600 hover:bg-teal-700 text-white',
      tabActive: 'border-teal-600 text-teal-700',
      ring: 'focus:border-teal-500 focus:ring-teal-500/20'
    },
    buyer: {
      accent: 'amber',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      btn: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold',
      tabActive: 'border-amber-500 text-amber-900',
      ring: 'focus:border-amber-500 focus:ring-amber-500/20'
    },
    public_buyer: {
      accent: 'amber',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      btn: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold',
      tabActive: 'border-amber-500 text-amber-900',
      ring: 'focus:border-amber-500 focus:ring-amber-500/20'
    }
  }[role] || {
    accent: 'indigo',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    tabActive: 'border-indigo-600 text-indigo-700',
    ring: 'focus:border-indigo-500 focus:ring-indigo-500/20'
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name,
      email,
      phone,
      cnic,
      societyName: role === 'society_admin' ? societyName : currentUser.societyName,
      licenseNo: role === 'dealer' ? dealerLicense : currentUser.licenseNo
    });
    triggerToast('Profile & credentials updated successfully!');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && !currentPassword) {
      triggerToast('Please enter your current password to set a new password.');
      return;
    }
    triggerToast('System settings and multi-channel notification preferences saved.');
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-xl font-extrabold shadow-xs">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              currentUser.name.charAt(0).toUpperCase()
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{currentUser.name}</h1>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${roleStyles.badge}`}>
                {role.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{currentUser.email} • {currentUser.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">NADRA ID Verification:</span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified
          </span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'profile'
              ? `${roleStyles.tabActive} border-current`
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile & Role Credentials</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'settings'
              ? `${roleStyles.tabActive} border-current`
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Notifications & Security Settings</span>
        </button>
      </div>

      {/* Tab 1: Profile Information */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-slate-500" />
              <span>Universal Account Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Legal Name (as per CNIC)</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none ${roleStyles.ring}`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Registered Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none ${roleStyles.ring}`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pakistani Mobile (+92)</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none ${roleStyles.ring}`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NADRA CNIC Number (13 Digits)</label>
                <input
                  type="text"
                  required
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  placeholder="34501-XXXXXXX-X"
                  className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono ${roleStyles.ring}`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Permanent Residential / Office Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none ${roleStyles.ring}`}
                />
              </div>
            </div>
          </div>

          {/* Role-Specific Card */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                {role === 'super_admin' && <Shield className="w-4 h-4 text-indigo-600" />}
                {role === 'society_admin' && <Building2 className="w-4 h-4 text-emerald-600" />}
                {role === 'dealer' && <Briefcase className="w-4 h-4 text-teal-600" />}
                {(role === 'buyer' || role === 'public_buyer') && <Heart className="w-4 h-4 text-amber-500" />}
                <span>Role-Specific Enterprise Credentials ({role.replace('_', ' ').toUpperCase()})</span>
              </h3>
            </div>

            {/* SUPER ADMIN FIELDS */}
            {role === 'super_admin' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Master Security Clearance</label>
                  <input
                    type="text"
                    disabled
                    value="Tier 1 - Full Governance Authority"
                    className="w-full p-2.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Admin ID</label>
                  <input
                    type="text"
                    disabled
                    value="ADM-MANZILIQ-001"
                    className="w-full p-2.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Super Admin System Scope</label>
                  <p className="text-xs text-slate-500 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                    Controls society verification approvals, listing duplicate moderation, dispute plot freezes, and immutable audit logs for the MANZILIQ real estate ecosystem.
                  </p>
                </div>
              </div>
            )}

            {/* SOCIETY ADMIN FIELDS */}
            {role === 'society_admin' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Registered Housing Society</label>
                  <input
                    type="text"
                    value={societyName}
                    onChange={(e) => setSocietyName(e.target.value)}
                    className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none ${roleStyles.ring}`}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">TMA / LDA NOC Registration #</label>
                  <input
                    type="text"
                    value={nocRegNumber}
                    onChange={(e) => setNocRegNumber(e.target.value)}
                    className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono ${roleStyles.ring}`}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SECP Corporate Registration #</label>
                  <input
                    type="text"
                    value={secpNumber}
                    onChange={(e) => setSecpNumber(e.target.value)}
                    className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono ${roleStyles.ring}`}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Society Land Area (Acres)</label>
                  <input
                    type="number"
                    value={totalAcreage}
                    onChange={(e) => setTotalAcreage(Number(e.target.value))}
                    className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none ${roleStyles.ring}`}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Official Escrow Bank Account for Installments</label>
                  <input
                    type="text"
                    value={escrowBank}
                    onChange={(e) => setEscrowBank(e.target.value)}
                    className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none ${roleStyles.ring}`}
                  />
                </div>
              </div>
            )}

            {/* DEALER FIELDS */}
            {role === 'dealer' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Real Estate Agency / Business Name</label>
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none ${roleStyles.ring}`}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Punjab Excise Realtor License #</label>
                  <input
                    type="text"
                    value={dealerLicense}
                    onChange={(e) => setDealerLicense(e.target.value)}
                    className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono ${roleStyles.ring}`}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Territory & Service Coverage Areas</label>
                  <input
                    type="text"
                    value={serviceAreas}
                    onChange={(e) => setServiceAreas(e.target.value)}
                    className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none ${roleStyles.ring}`}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Standard Commission Split Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono ${roleStyles.ring}`}
                  />
                </div>
              </div>
            )}

            {/* BUYER / CUSTOMER FIELDS */}
            {(role === 'buyer' || role === 'public_buyer') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Investor Category</label>
                  <select
                    value={investorType}
                    onChange={(e) => setInvestorType(e.target.value)}
                    className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none ${roleStyles.ring}`}
                  >
                    <option value="End-User / Home Builder">End-User / Home Builder</option>
                    <option value="Overseas Pakistani Investor">Overseas Pakistani Investor</option>
                    <option value="Short-Term File Trader">Short-Term File Trader</option>
                    <option value="Long-Term Land Holding">Long-Term Land Holding</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Budget Range (PKR)</label>
                  <input
                    type="text"
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none ${roleStyles.ring}`}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Plot Dimensions</label>
                  <input
                    type="text"
                    value={preferredSizes}
                    onChange={(e) => setPreferredSizes(e.target.value)}
                    className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none ${roleStyles.ring}`}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Overseas NICOP / Passport # (Optional)</label>
                  <input
                    type="text"
                    value={nicopPassport}
                    onChange={(e) => setNicopPassport(e.target.value)}
                    className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono ${roleStyles.ring}`}
                  />
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${roleStyles.btn}`}
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Settings & Security */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          {/* Multi-Channel 3-Tier Notifications */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-500" />
              <span>3-Tier Multi-Channel Notification Preferences</span>
            </h3>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block">Tier 1: Email Notifications & Official Receipts</strong>
                  <p className="text-slate-500 text-[11px]">Receive signed allotment PDFs, bank payment receipts, and monthly account summaries.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="w-4 h-4 accent-slate-900"
                />
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block">Tier 2: SMS OTP & Urgent Installment Reminders</strong>
                  <p className="text-slate-500 text-[11px]">Instant text alert 3 days prior to monthly installment deadline and booking verification OTPs.</p>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="w-4 h-4 accent-slate-900"
                />
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block">Tier 3: WhatsApp Instant Dispatch</strong>
                  <p className="text-slate-500 text-[11px]">Direct WhatsApp message dispatch with interactive plot map link when new lots are assigned.</p>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappUpdates}
                  onChange={(e) => setWhatsappUpdates(e.target.checked)}
                  className="w-4 h-4 accent-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Security & Password */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-500" />
              <span>Security & Access Credentials</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Secure Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters with symbols"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <strong className="text-slate-900 block text-xs">Two-Factor Authentication (2FA)</strong>
                <p className="text-slate-500 text-[11px]">Require NADRA/SMS OTP code on every login attempt.</p>
              </div>
              <button
                type="button"
                onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                  twoFactorAuth
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {twoFactorAuth ? '2FA Enabled' : 'Enable 2FA'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${roleStyles.btn}`}
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
