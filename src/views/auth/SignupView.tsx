import React, { useState } from 'react';
import { User, UserRole, VerificationRequest } from '../../types';
import { ManzilIQLogo } from '../../components/common/ManzilIQLogo';
import { 
  UserPlus, 
  Upload, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  ArrowRight,
  AlertCircle,
  FileCheck2,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  FileText,
  X,
  Sparkles
} from 'lucide-react';

interface SignupViewProps {
  lastVisitedProperty?: string | null;
  onSignupSuccess: (newUser: User, verificationReq?: VerificationRequest) => void;
  onNavigate: (route: string) => void;
}

export const SignupView: React.FC<SignupViewProps> = ({
  lastVisitedProperty,
  onSignupSuccess,
  onNavigate
}) => {
  const [role, setRole] = useState<UserRole>('buyer');
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cnic, setCnic] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [societyName, setSocietyName] = useState('');

  // Uploaded Files (with base64 previews)
  const [cnicFile, setCnicFile] = useState<{ name: string; size: string; previewUrl: string } | null>(null);
  const [licenseFile, setLicenseFile] = useState<{ name: string; size: string; previewUrl: string } | null>(null);
  const [nocFile, setNocFile] = useState<{ name: string; size: string; previewUrl: string } | null>(null);
  const [secpFile, setSecpFile] = useState<{ name: string; size: string; previewUrl: string } | null>(null);

  // Validation Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // OTP State
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpDispatchedToast, setOtpDispatchedToast] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCountdown, setResendCountdown] = useState<number>(60);

  // CNIC Province & Division Decoder
  const getCnicVerificationDetails = (cnicStr: string) => {
    const digits = cnicStr.replace(/\D/g, '');
    if (digits.length < 5) return null;
    const firstDigit = digits.charAt(0);
    const prefix5 = digits.slice(0, 5);

    let province = 'Pakistan National';
    let division = '';

    if (prefix5.startsWith('345')) {
      province = 'Punjab';
      division = 'Lahore & Central Division';
    } else if (prefix5.startsWith('352')) {
      province = 'Punjab';
      division = 'Lahore Metropolitan';
    } else if (firstDigit === '1') {
      province = 'KPK';
      division = 'Khyber Pakhtunkhwa';
    } else if (firstDigit === '2') {
      province = 'Merged Districts';
      division = 'FATA Region';
    } else if (firstDigit === '3') {
      province = 'Punjab';
      division = 'Punjab Province';
    } else if (firstDigit === '4') {
      province = 'Sindh';
      division = 'Sindh Province';
    } else if (firstDigit === '5') {
      province = 'Balochistan';
      division = 'Balochistan Province';
    } else if (firstDigit === '6') {
      province = 'Islamabad';
      division = 'Capital Territory (ICT)';
    } else if (firstDigit === '7') {
      province = 'AJK / Gilgit-Baltistan';
      division = 'Northern Region';
    }

    const isValidLength = digits.length === 13;
    return {
      province,
      division,
      isValidLength,
      gender: parseInt(digits.slice(-1) || '0', 10) % 2 === 0 ? 'Female' : 'Male'
    };
  };

  const cnicInfo = getCnicVerificationDetails(cnic);

  // Quick 1-Click Test Buyer Autofill
  const handleAutoFillDemoBuyer = () => {
    setName('Muhammad Farooq');
    setEmail(`buyer.farooq${Math.floor(Math.random() * 900) + 100}@gmail.com`);
    setPhone('+92 300 8472910');
    setPassword('Pass_123@#');
    setCnic('34501-8472910-3');
    setCnicFile({
      name: 'cnic_nadra_verified_front_back.png',
      size: '1.4 MB',
      previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400'
    });
    setErrors({});
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0 to 4
  };

  const passwordScore = getPasswordStrength(password);

  // Format CNIC as user types: XXXXX-XXXXXXX-X
  const handleCnicChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 13);
    let formatted = digitsOnly;
    if (digitsOnly.length > 5 && digitsOnly.length <= 12) {
      formatted = `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5)}`;
    } else if (digitsOnly.length > 12) {
      formatted = `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5, 12)}-${digitsOnly.slice(12, 13)}`;
    }
    setCnic(formatted);
  };

  // Format Pakistani Phone: +92 3XX XXXXXXX
  const handlePhoneChange = (val: string) => {
    setPhone(val);
  };

  // Attach sample CNIC helper for quick testing
  const handleUseSampleCnicScan = () => {
    setCnicFile({
      name: 'nadra_smart_cnic_sample.png',
      size: '1.2 MB',
      previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400'
    });
    setErrors(prev => ({ ...prev, cnicFile: '' }));
  };

  // Handle generic file input reading
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<{ name: string; size: string; previewUrl: string } | null>>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeKB = (file.size / 1024).toFixed(1);
    const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${sizeKB} KB`;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setter({
          name: file.name,
          size: sizeStr,
          previewUrl: (ev.target?.result as string) || ''
        });
      };
      reader.readAsDataURL(file);
    } else {
      // PDF or Doc mock icon/preview
      setter({
        name: file.name,
        size: sizeStr,
        previewUrl: 'pdf_doc'
      });
    }
  };

  // Validate form before proceeding to OTP
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim() || name.trim().length < 3) {
      newErrors.name = 'Please enter your full legal name (minimum 3 characters).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number (at least 10 digits).';
    }

    if (passwordScore < 3) {
      newErrors.password = 'Password is too weak. Ensure at least 8 characters, 1 uppercase, 1 number, and 1 special symbol.';
    }

    const cleanCnic = cnic.replace(/\D/g, '');
    if (cleanCnic.length !== 13) {
      newErrors.cnic = 'CNIC must be strictly 13 numeric digits.';
    }

    if (!cnicFile) {
      newErrors.cnicFile = 'Please upload a clear scanned copy of your NADRA CNIC.';
    }

    if (role === 'dealer') {
      if (!licenseNo.trim()) {
        newErrors.licenseNo = 'Please provide your Realtors Excise/TMA license registration number.';
      }
      if (!licenseFile) {
        newErrors.licenseFile = 'Please upload your official Real Estate Agency License.';
      }
    }

    if (role === 'society_admin') {
      if (!societyName.trim()) {
        newErrors.societyName = 'Please enter the Housing Society or Township name.';
      }
      if (!nocFile) {
        newErrors.nocFile = 'Please upload the TMA / LDA approved NOC Certificate.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Start OTP Flow
  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Generate random 6-digit code
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomCode);
    setEnteredOtp('');
    setOtpError(null);
    setStep('otp');

    // Trigger instant simulated SMS code banner
    setOtpDispatchedToast(`[SMS & WhatsApp Dispatch] Your 6-digit MANZILIQ security code is: ${randomCode}`);
  };

  // Final OTP Submission & Account Creation
  const handleVerifyOtpAndCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim() !== generatedOtp) {
      setOtpError(`Invalid OTP code entered. Please enter the exact 6-digit code (${generatedOtp}) sent to your mobile.`);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      const isPending = role === 'dealer' || role === 'society_admin';
      const newUserId = `usr-${Date.now().toString().slice(-6)}`;

      const newUser: User = {
        id: newUserId,
        name,
        email,
        phone,
        password,
        role,
        verified: !isPending,
        status: isPending ? 'pending' : 'active',
        cnic,
        cnicDocUrl: cnicFile?.previewUrl !== 'pdf_doc' ? cnicFile?.previewUrl : undefined,
        licenseNo: role === 'dealer' ? licenseNo : undefined,
        societyName: role === 'society_admin' ? societyName : undefined,
        createdAt: new Date().toISOString().split('T')[0]
      };

      let verificationReq: VerificationRequest | undefined;
      if (isPending) {
        verificationReq = {
          id: `ver-${Date.now().toString().slice(-4)}`,
          userId: newUserId,
          userName: name,
          email,
          phone,
          role,
          societyName: role === 'society_admin' ? societyName : undefined,
          submittedAt: new Date().toLocaleString(),
          status: 'pending',
          cnicNumber: cnic,
          cnicDocName: cnicFile?.name || 'cnic_scan.pdf',
          licenseDocName: licenseFile?.name,
          nocDocName: nocFile?.name,
          secpDocName: secpFile?.name,
          comments: `Applicant registered online as ${role.replace('_', ' ')}. Awaiting municipal review.`
        };
      }

      onSignupSuccess(newUser, verificationReq);
    }, 700);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 bg-slate-50">
      
        {/* Real-time SMS Toast Banner */}
        {otpDispatchedToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4">
            <div className="bg-slate-900 border-2 border-amber-400 text-white p-4 rounded-2xl shadow-2xl flex items-start justify-between gap-3 animate-slide-down">
              <div className="flex items-start gap-2.5">
                <Smartphone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <span>Simulated Carrier SMS Gateway</span>
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">OTP: {generatedOtp}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5">
                    {otpDispatchedToast}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEnteredOtp(generatedOtp);
                        setOtpError(null);
                      }}
                      className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] rounded-lg transition cursor-pointer shadow-xs"
                    >
                      ⚡ Auto-Fill Code ({generatedOtp})
                    </button>
                    <span className="text-[10px] text-slate-400">
                      Recipient: {phone || '+92 300 0000000'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOtpDispatchedToast(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          
          {/* Top Header & Fast Test Fill Helper */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div 
                onClick={() => onNavigate('/')} 
                className="cursor-pointer inline-flex"
              >
                <ManzilIQLogo variant="compact" size="md" theme="light" showTagline={false} />
              </div>
              {step === 'form' && role === 'buyer' && (
                <button
                  type="button"
                  onClick={handleAutoFillDemoBuyer}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>⚡ 1-Click Test Buyer Fill</span>
                </button>
              )}
            </div>

            <div className="text-center space-y-1 pt-1 border-t border-slate-100">
              <h2 className="text-2xl font-black font-[Outfit] text-slate-900 tracking-tight">
                {step === 'form' ? 'Create Official MANZILIQ Account' : '2-Factor Mobile & CNIC Verification'}
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {step === 'form' 
                  ? 'Join the unified digital real estate management & title verification network.'
                  : `Enter the 6-digit confirmation code dispatched to ${phone || 'your phone'} to finalize activation.`}
              </p>
            </div>
          </div>

        {/* Return to Property Destination Banner */}
        {lastVisitedProperty && (
          <div className="p-3 bg-amber-50 border border-amber-300/80 rounded-2xl text-xs text-amber-950 flex items-center justify-between gap-2.5 shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="font-medium text-[11px] leading-tight">
                Your selected property will be loaded immediately after your buyer account is created.
              </span>
            </div>
            <span className="px-2 py-0.5 bg-amber-200/80 text-amber-900 font-bold text-[10px] rounded-full shrink-0 uppercase tracking-wide">
              Auto-Return
            </span>
          </div>
        )}

        {step === 'form' ? (
          <>
            {/* Persona Role Selection Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`py-2.5 px-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  role === 'buyer' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>👤 Buyer / Allottee</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('dealer')}
                className={`py-2.5 px-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  role === 'dealer' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>🏢 Real Estate Agent</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('society_admin')}
                className={`py-2.5 px-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  role === 'society_admin' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>🏘️ Society Developer</span>
              </button>
            </div>

            {/* Role Notice */}
            <div className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
              role === 'buyer' 
                ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                : 'bg-amber-50 text-amber-950 border border-amber-200'
            }`}>
              <ShieldCheck className={`w-4 h-4 shrink-0 mt-0.5 ${role === 'buyer' ? 'text-emerald-700' : 'text-amber-700'}`} />
              <div>
                {role === 'buyer' ? (
                  <span><strong>Instant Buyer Activation:</strong> Buyers receive immediate access to plot reservations, digital document lockers, and installment schedules.</span>
                ) : (
                  <span><strong>Super Admin Verification Queue:</strong> Dealer and Developer accounts undergo municipal compliance check. Registration status will start as <em>Pending</em>.</span>
                )}
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleProceedToOtp} className="space-y-4 text-xs">
              
              {/* Full Legal Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Legal Name (as per NADRA CNIC) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Muhammad Farooq"
                  className={`w-full p-2.5 bg-slate-50 border rounded-xl outline-none text-xs transition ${
                    errors.name ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-emerald-600'
                  }`}
                />
                {errors.name && <p className="text-rose-600 text-[11px] mt-1">{errors.name}</p>}
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl outline-none text-xs transition ${
                      errors.email ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-emerald-600'
                    }`}
                  />
                  {errors.email && <p className="text-rose-600 text-[11px] mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    WhatsApp / Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+92 300 8472910"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl outline-none text-xs transition ${
                      errors.phone ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-emerald-600'
                    }`}
                  />
                  {errors.phone && <p className="text-rose-600 text-[11px] mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Password & Strength Meter */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    Account Password <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">Min 8 chars, 1 Uppercase, 1 Number, 1 Symbol</span>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create secure password"
                    className={`w-full p-2.5 pr-10 bg-slate-50 border rounded-xl outline-none text-xs transition ${
                      errors.password ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-emerald-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="grid grid-cols-4 gap-1.5 h-1.5 rounded-full overflow-hidden">
                      <div className={`rounded-full transition-all ${passwordScore >= 1 ? 'bg-rose-500' : 'bg-slate-200'}`} />
                      <div className={`rounded-full transition-all ${passwordScore >= 2 ? 'bg-amber-500' : 'bg-slate-200'}`} />
                      <div className={`rounded-full transition-all ${passwordScore >= 3 ? 'bg-blue-500' : 'bg-slate-200'}`} />
                      <div className={`rounded-full transition-all ${passwordScore >= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                      <span>Strength: {passwordScore === 0 ? 'Too Weak' : passwordScore === 1 ? 'Weak' : passwordScore === 2 ? 'Fair' : passwordScore === 3 ? 'Good' : 'Strong'}</span>
                      <span className={passwordScore >= 3 ? 'text-emerald-700' : 'text-slate-400'}>
                        {passwordScore >= 3 ? '✓ Compliant' : 'Must reach Good/Strong'}
                      </span>
                    </div>
                  </div>
                )}
                {errors.password && <p className="text-rose-600 text-[11px] mt-1">{errors.password}</p>}
              </div>

              {/* NADRA CNIC Input with Live Verification Indicator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    13-Digit NADRA CNIC Number <span className="text-rose-500">*</span>
                  </label>
                  {cnicInfo && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                      cnicInfo.isValidLength 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {cnicInfo.isValidLength ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-amber-600" />}
                      <span>{cnicInfo.province} • {cnicInfo.division}</span>
                    </span>
                  )}
                </div>
                
                <input
                  type="text"
                  required
                  value={cnic}
                  onChange={(e) => handleCnicChange(e.target.value)}
                  placeholder="34501-8472910-3"
                  className={`w-full p-2.5 font-mono bg-slate-50 border rounded-xl outline-none text-xs tracking-wider transition ${
                    errors.cnic ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-emerald-600'
                  }`}
                />
                
                {errors.cnic ? (
                  <p className="text-rose-600 text-[11px] mt-1">{errors.cnic}</p>
                ) : (
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>Format: XXXXX-XXXXXXX-X (13 numeric digits)</span>
                    {cnic.replace(/\D/g, '').length === 13 && (
                      <span className="text-emerald-700 font-bold">✓ 13 Digits Complete (NADRA Compliant)</span>
                    )}
                  </div>
                )}
              </div>

              {/* CNIC Document Upload Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    Attach Scanned CNIC (Front & Back) <span className="text-rose-500">*</span>
                  </label>
                  {!cnicFile && (
                    <button
                      type="button"
                      onClick={handleUseSampleCnicScan}
                      className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 underline cursor-pointer"
                    >
                      Use Sample Verified Scan
                    </button>
                  )}
                </div>
                
                {cnicFile ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-300 rounded-2xl">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {cnicFile.previewUrl.startsWith('data:image') || cnicFile.previewUrl.startsWith('https://') ? (
                        <img src={cnicFile.previewUrl} alt="Preview" className="w-10 h-8 object-cover rounded-lg border border-emerald-300 shrink-0" />
                      ) : (
                        <FileText className="w-6 h-6 text-emerald-700 shrink-0" />
                      )}
                      <div className="truncate text-xs">
                        <div className="font-bold text-emerald-950 truncate">{cnicFile.name}</div>
                        <div className="text-[10px] text-emerald-700">{cnicFile.size} • Ready for verification</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCnicFile(null)}
                      className="p-1.5 hover:bg-emerald-200 text-emerald-900 rounded-lg transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className={`border-2 border-dashed rounded-2xl p-4 text-center block cursor-pointer transition ${
                    errors.cnicFile ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                  }`}>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e, setCnicFile)}
                      className="hidden"
                    />
                    <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <span className="font-bold text-slate-800 block text-xs">Click to browse or drop NADRA CNIC file</span>
                    <span className="text-[10px] text-slate-400">Supports JPG, PNG, PDF up to 10MB</span>
                  </label>
                )}
                {errors.cnicFile && <p className="text-rose-600 text-[11px] mt-1">{errors.cnicFile}</p>}
              </div>

              {/* Conditional Dealer Fields */}
              {role === 'dealer' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-800" />
                    <span>Real Estate Agency Credentials</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Punjab Excise / TMA Realtor License No. <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={licenseNo}
                      onChange={(e) => setLicenseNo(e.target.value)}
                      placeholder="e.g. REA-NRL-2026-99"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none text-xs focus:border-emerald-600"
                    />
                    {errors.licenseNo && <p className="text-rose-600 text-[11px] mt-1">{errors.licenseNo}</p>}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Upload Broker License Certificate <span className="text-rose-500">*</span>
                    </label>
                    {licenseFile ? (
                      <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl">
                        <span className="font-bold text-emerald-950 text-xs truncate">{licenseFile.name} ({licenseFile.size})</span>
                        <button type="button" onClick={() => setLicenseFile(null)}><X className="w-4 h-4 text-emerald-900" /></button>
                      </div>
                    ) : (
                      <label className="border border-dashed border-slate-300 rounded-xl p-3 text-center block cursor-pointer bg-white hover:bg-slate-100">
                        <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, setLicenseFile)} className="hidden" />
                        <Upload className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                        <span className="font-bold text-slate-700 text-xs">Attach Realtor License Certificate (PDF/Image)</span>
                      </label>
                    )}
                    {errors.licenseFile && <p className="text-rose-600 text-[11px] mt-1">{errors.licenseFile}</p>}
                  </div>
                </div>
              )}

              {/* Conditional Society Admin Fields */}
              {role === 'society_admin' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-800" />
                    <span>Township Developer Credentials</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Housing Scheme / Project Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={societyName}
                      onChange={(e) => setSocietyName(e.target.value)}
                      placeholder="e.g. Al-Haram City Lahore"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none text-xs focus:border-emerald-600"
                    />
                    {errors.societyName && <p className="text-rose-600 text-[11px] mt-1">{errors.societyName}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        TMA / LDA Approval NOC <span className="text-rose-500">*</span>
                      </label>
                      {nocFile ? (
                        <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-300 rounded-xl text-[11px]">
                          <span className="font-bold text-emerald-950 truncate">{nocFile.name}</span>
                          <button type="button" onClick={() => setNocFile(null)}><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <label className="border border-dashed border-slate-300 rounded-xl p-2.5 text-center block cursor-pointer bg-white hover:bg-slate-100">
                          <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileUpload(e, setNocFile)} className="hidden" />
                          <span className="font-bold text-slate-700 text-xs">Attach NOC (PDF)</span>
                        </label>
                      )}
                      {errors.nocFile && <p className="text-rose-600 text-[11px] mt-1">{errors.nocFile}</p>}
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">SECP Incorporation Certificate</label>
                      {secpFile ? (
                        <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-300 rounded-xl text-[11px]">
                          <span className="font-bold text-emerald-950 truncate">{secpFile.name}</span>
                          <button type="button" onClick={() => setSecpFile(null)}><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <label className="border border-dashed border-slate-300 rounded-xl p-2.5 text-center block cursor-pointer bg-white hover:bg-slate-100">
                          <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileUpload(e, setSecpFile)} className="hidden" />
                          <span className="font-bold text-slate-700 text-xs">Attach SECP (Optional)</span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button to OTP */}
              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs font-extrabold transition shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <span>Proceed to 2FA OTP Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          /* Step 2: OTP Verification Screen */
          <form onSubmit={handleVerifyOtpAndCreateAccount} className="space-y-5 text-xs">
            
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-950 space-y-2">
              <div className="flex items-center gap-2 font-black text-emerald-900">
                <Smartphone className="w-4 h-4 text-emerald-700" />
                <span>One-Time Password (OTP) Required</span>
              </div>
              <p className="text-slate-600">
                A 6-digit authentication pin has been generated and dispatched to your contact number <strong>{phone}</strong>.
              </p>
              <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Dispatched OTP PIN</span>
                  <span className="text-xl font-black font-mono tracking-widest text-emerald-900">{generatedOtp}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEnteredOtp(generatedOtp);
                    setOtpError(null);
                  }}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg font-black text-[11px] transition cursor-pointer shadow-xs"
                >
                  ⚡ Auto-Fill Code
                </button>
              </div>
            </div>

            <div>
              <label className="block font-black text-slate-800 mb-1.5 text-center">
                Type the 6-Digit OTP Security Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                className="w-full text-center text-2xl font-mono tracking-[0.5em] py-3 bg-slate-50 border border-slate-300 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-600 font-bold"
              />
              {otpError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-bold text-xs mt-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{otpError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => {
                  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                  setGeneratedOtp(newCode);
                  setEnteredOtp('');
                  setOtpError(null);
                  setOtpDispatchedToast(`[Resent SMS] New 6-digit MANZILIQ security code is: ${newCode}`);
                }}
                className="text-emerald-800 font-bold hover:underline cursor-pointer"
              >
                Resend Code
              </button>

              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
              >
                ← Back to Edit Details
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || enteredOtp.length !== 6}
              className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs font-extrabold transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Verifying & Creating Profile...' : 'Verify OTP & Complete Registration'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>

          </form>
        )}

        <div className="text-center text-xs text-slate-600 pt-3 border-t border-slate-100">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('/login')}
            className="font-bold text-emerald-800 hover:underline cursor-pointer"
          >
            Sign In to Existing Account
          </button>
        </div>

      </div>
    </div>
  );
};
