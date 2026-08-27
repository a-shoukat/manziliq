import { 
  Society, 
  Plot, 
  Property, 
  User, 
  Booking, 
  Installment, 
  Payment,
  DealerLead, 
  NotificationItem, 
  Inquiry, 
  DocumentItem,
  LotAssignment,
  DealerSocietyRelation,
  DealerLotRequest,
  LotAuditTrailEntry,
  Dispute,
  VerificationRequest
} from '../src/types';

// ==============================================================================
// 1. PROFILES & USERS (All 4 Core Roles)
// ==============================================================================
export const SEED_USERS: User[] = [
  // Super Admins
  {
    id: 'u-admin-1',
    user_id: 'u-admin-1',
    name: 'Ayesha Shoukat (Super Admin)',
    full_name: 'Ayesha Shoukat (Super Admin)',
    email: 'ayeshashoukat2023cs512@gmail.com',
    phone: '+92 300 0001122',
    cnic: '34501-0001122-8',
    password: 'Password123@#',
    role: 'super_admin',
    verified: true,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    createdAt: '2025-10-01'
  },
  {
    id: 'u-admin-2',
    user_id: 'u-admin-2',
    name: 'Punjab Land Authority Regulator',
    full_name: 'Punjab Land Authority Regulator',
    email: 'auditor.punjab@manziliq.pk',
    phone: '+92 300 9988776',
    cnic: '34501-9988776-1',
    password: 'Password123@#',
    role: 'super_admin',
    verified: true,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
    createdAt: '2025-11-01'
  },

  // Society Admins (Narowal District Projects)
  {
    id: 'u-society-1',
    user_id: 'u-society-1',
    name: 'Engr. Tariq Mehmood',
    full_name: 'Engr. Tariq Mehmood',
    email: 'admin@alrehmangarden.pk',
    phone: '+92 301 4455889',
    cnic: '34501-4455889-1',
    role: 'society_admin',
    societyId: 'soc-nwl-1',
    societyName: 'Al-Rehman Garden Narowal',
    password: 'Password123@#',
    verified: true,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    createdAt: '2025-11-20'
  },
  {
    id: 'u-society-2',
    user_id: 'u-society-2',
    name: 'Ch. Zulfiqar Ali',
    full_name: 'Ch. Zulfiqar Ali',
    email: 'admin@modelcitynarowal.pk',
    phone: '+92 300 5544332',
    cnic: '34501-5544332-3',
    role: 'society_admin',
    societyId: 'soc-nwl-2',
    societyName: 'Model City Housing Narowal',
    password: 'Password123@#',
    verified: true,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    createdAt: '2025-12-05'
  },
  {
    id: 'u-society-3',
    user_id: 'u-society-3',
    name: 'Brig. (R) Asim Javed',
    full_name: 'Brig. (R) Asim Javed',
    email: 'admin@royalpalmnarowal.pk',
    phone: '+92 322 7788990',
    cnic: '34501-7788990-5',
    role: 'society_admin',
    societyId: 'soc-nwl-3',
    societyName: 'Royal Palm City Narowal',
    password: 'Password123@#',
    verified: true,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-01-10'
  },
  {
    id: 'u-society-4',
    user_id: 'u-society-4',
    name: 'Malik Khurram Shahzad',
    full_name: 'Malik Khurram Shahzad',
    email: 'admin@greenvalley.pk',
    phone: '+92 345 6677889',
    cnic: '34502-6677889-7',
    role: 'society_admin',
    societyId: 'soc-nwl-4',
    societyName: 'Green Valley Enclave Shakargarh',
    password: 'Password123@#',
    verified: true,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-01-25'
  },

  // Certified Dealers in Narowal District (5 Dealers)
  {
    id: 'u-dealer-1',
    user_id: 'u-dealer-1',
    name: 'Chaudhry Tariq Real Estate',
    full_name: 'Chaudhry Tariq Real Estate',
    email: 'tariq.realtor@manziliq.pk',
    phone: '+92 321 9847201',
    cnic: '34501-9847201-1',
    licenseNo: 'REA-NWL-2024-101',
    password: 'Password123@#',
    role: 'dealer',
    verified: true,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-02-01'
  },
  {
    id: 'u-dealer-2',
    user_id: 'u-dealer-2',
    name: 'Bismillah Property Network Narowal',
    full_name: 'Bismillah Property Network Narowal',
    email: 'bismillah.realtors@gmail.com',
    phone: '+92 333 4455667',
    cnic: '34501-4455667-5',
    licenseNo: 'REA-NWL-2023-045',
    password: 'Password123@#',
    role: 'dealer',
    verified: true,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-02-05'
  },
  {
    id: 'u-dealer-3',
    user_id: 'u-dealer-3',
    name: 'Al-Madina Estate & Marketing',
    full_name: 'Al-Madina Estate & Marketing',
    email: 'almadina.estate.nwl@gmail.com',
    phone: '+92 300 7654321',
    cnic: '34501-7654321-9',
    licenseNo: 'REA-NWL-2024-078',
    password: 'Password123@#',
    role: 'dealer',
    verified: true,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-02-10'
  },
  {
    id: 'u-dealer-4',
    user_id: 'u-dealer-4',
    name: 'Subhan Real Estate Shakargarh',
    full_name: 'Subhan Real Estate Shakargarh',
    email: 'subhan.estate@gmail.com',
    phone: '+92 302 8899001',
    cnic: '34502-8899001-3',
    licenseNo: 'REA-NWL-2023-112',
    password: 'Password123@#',
    role: 'dealer',
    verified: true,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-02-12'
  },
  {
    id: 'u-dealer-5',
    user_id: 'u-dealer-5',
    name: 'Royal Associates & Developers',
    full_name: 'Royal Associates & Developers',
    email: 'royal.associates.nwl@gmail.com',
    phone: '+92 312 3344556',
    cnic: '34501-3344556-7',
    licenseNo: 'REA-NWL-2024-099',
    password: 'Password123@#',
    role: 'dealer',
    verified: true,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-02-15'
  },

  // 12 Customer / Buyer Accounts (Local & Overseas Pakistani Buyers)
  {
    id: 'u-buyer-1',
    user_id: 'u-buyer-1',
    name: 'Muhammad Farooq',
    full_name: 'Muhammad Farooq',
    email: 'farooq.buyer@gmail.com',
    phone: '+92 300 8472910',
    cnic: '34501-8472910-3',
    password: 'Password123@#',
    role: 'buyer',
    verified: true,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-01-15'
  },
  {
    id: 'u-buyer-2',
    user_id: 'u-buyer-2',
    name: 'Dr. Naveed Iqbal',
    full_name: 'Dr. Naveed Iqbal',
    email: 'dr.naveed.iqbal@gmail.com',
    phone: '+92 301 9876543',
    cnic: '34501-9876543-1',
    password: 'Password123@#',
    role: 'buyer',
    verified: true,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-02-01'
  },
  {
    id: 'u-buyer-3',
    user_id: 'u-buyer-3',
    name: 'Usman Ghani',
    full_name: 'Usman Ghani',
    email: 'usman.ghani.nwl@hotmail.com',
    phone: '+92 322 1234567',
    cnic: '34501-1234567-7',
    password: 'Password123@#',
    role: 'buyer',
    verified: true,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-02-05'
  },
  {
    id: 'u-buyer-4',
    user_id: 'u-buyer-4',
    name: 'Mian Tahir Mahmood',
    full_name: 'Mian Tahir Mahmood',
    email: 'tahir.mahmood@transworld.pk',
    phone: '+92 333 9988112',
    cnic: '34501-9988112-9',
    password: 'Password123@#',
    role: 'buyer',
    verified: true,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-02-08'
  },
  {
    id: 'u-buyer-5',
    user_id: 'u-buyer-5',
    name: 'Hafiz Bilal Ahmed',
    full_name: 'Hafiz Bilal Ahmed',
    email: 'bilal.ahmed.engr@gmail.com',
    phone: '+92 304 4433221',
    cnic: '34501-4433221-5',
    password: 'Password123@#',
    role: 'buyer',
    verified: true,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-02-10'
  },
  {
    id: 'u-buyer-6',
    user_id: 'u-buyer-6',
    name: 'Mrs. Samina Kausar',
    full_name: 'Mrs. Samina Kausar',
    email: 'samina.kausar@yahoo.com',
    phone: '+92 305 7766554',
    cnic: '34501-7766554-2',
    password: 'Password123@#',
    role: 'buyer',
    verified: true,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-02-14'
  },
  {
    id: 'u-buyer-7',
    user_id: 'u-buyer-7',
    name: 'Kamran Akram (Overseas Buyer - UK)',
    full_name: 'Kamran Akram (Overseas Buyer - UK)',
    email: 'kamran.akram.uk@gmail.com',
    phone: '+44 7700 900123',
    cnic: '34501-3322114-1',
    password: 'Password123@#',
    role: 'buyer',
    verified: true,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-02-18'
  },
  {
    id: 'u-buyer-8',
    user_id: 'u-buyer-8',
    name: 'Rashid Minhas',
    full_name: 'Rashid Minhas',
    email: 'rashid.minhas.nwl@gmail.com',
    phone: '+92 306 1122334',
    cnic: '34501-1122334-7',
    password: 'Password123@#',
    role: 'buyer',
    verified: true,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-02-20'
  },
  {
    id: 'u-buyer-9',
    user_id: 'u-buyer-9',
    name: 'Zeeshan Haider (Advocate)',
    full_name: 'Zeeshan Haider (Advocate)',
    email: 'zeeshan.haider.adv@gmail.com',
    phone: '+92 321 5566778',
    cnic: '34501-5566778-3',
    password: 'Password123@#',
    role: 'buyer',
    verified: true,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-02-22'
  },
  {
    id: 'u-buyer-10',
    user_id: 'u-buyer-10',
    name: 'Shahbaz Sharif Bhatti',
    full_name: 'Shahbaz Sharif Bhatti',
    email: 'shahbaz.bhatti@gmail.com',
    phone: '+92 307 9900112',
    cnic: '34501-9900112-5',
    password: 'Password123@#',
    role: 'buyer',
    verified: true,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-02-24'
  },
  {
    id: 'u-buyer-11',
    user_id: 'u-buyer-11',
    name: 'Faisal Jamil',
    full_name: 'Faisal Jamil',
    email: 'faisal.jamil.nwl@outlook.com',
    phone: '+92 308 2233445',
    cnic: '34501-2233445-9',
    password: 'Password123@#',
    role: 'buyer',
    verified: true,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-02-25'
  },
  {
    id: 'u-buyer-12',
    user_id: 'u-buyer-12',
    name: 'Tariq Masood (Merchant)',
    full_name: 'Tariq Masood (Merchant)',
    email: 'tariq.masood.traders@gmail.com',
    phone: '+92 309 6677881',
    cnic: '34501-6677881-1',
    password: 'Password123@#',
    role: 'buyer',
    verified: true,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-02-25'
  }
];

// ==============================================================================
// 2. HOUSING SOCIETIES (Narowal District - Approved Schemes)
// ==============================================================================
export const SEED_SOCIETIES: Society[] = [
  {
    id: 'soc-nwl-1',
    name: 'Al-Rehman Garden Narowal',
    societyCode: 'ARG',
    societyIdCode: 'SOC-0001',
    city: 'Narowal',
    district: 'Narowal',
    location: 'Main Zafarwal Road, Near Bypass Chowk, Narowal',
    totalPlots: 40,
    availablePlots: 24, // 60%
    reservedPlots: 8,   // 20%
    soldPlots: 6,       // 15% (2 under dispute = 5%)
    heroImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000',
    description: 'Premier TMA-Narowal & LDA-compliant luxury housing society offering 3, 5, 10 Marla and 1 Kanal residential & commercial plots with 100ft main boulevard, underground electrification, 24/7 smart security, and Jamia mosque.',
    amenities: ['Underground Electricity', '24/7 Gated Security', 'Community Park', 'Grand Mosque', 'Commercial Zone', 'Sewerage System', 'Fiber Optic Internet'],
    approvalStatus: 'approved',
    contactPhone: '+92 301 4455889',
    nocNumber: 'TMA-NWL/NOC/2023/419',
    nocDocUrl: 'https://manziliq.pk/docs/noc-alrehman-narowal.pdf',
    secpDocUrl: 'https://manziliq.pk/docs/secp-alrehman.pdf',
    lateFeePercent: 2.5,
    downPaymentPercent: 20,
    standardDurationMonths: 36,
    mapEmbedUrl: 'https://maps.google.com/maps?q=Narowal+Punjab+Pakistan&t=&z=14&ie=UTF8&iwloc=&output=embed'
  },
  {
    id: 'soc-nwl-2',
    name: 'Model City Housing Narowal',
    societyCode: 'MCH',
    societyIdCode: 'SOC-0002',
    city: 'Narowal',
    district: 'Narowal',
    location: 'Circular Road, Opposite DHQ Hospital, Narowal',
    totalPlots: 36,
    availablePlots: 22, // 61%
    reservedPlots: 7,   // 19.4%
    soldPlots: 6,       // 16.6% (1 under dispute = 2.8%)
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000',
    description: 'Heart-of-the-city prime residential society in Narowal with ready utility connections, direct hospital access, school branches, and high rental return potential with immediate registry transfer.',
    amenities: ['Prime Commercial Hub', '24/7 Gas & Water Supply', 'Hospital Proximity', 'Graveyard Area', 'High Rental Demand', 'Carpeted Roads'],
    approvalStatus: 'approved',
    contactPhone: '+92 300 5544332',
    nocNumber: 'TMA-NWL/NOC/2022/105',
    nocDocUrl: 'https://manziliq.pk/docs/noc-modelcity-narowal.pdf',
    secpDocUrl: 'https://manziliq.pk/docs/secp-modelcity.pdf',
    lateFeePercent: 3.0,
    downPaymentPercent: 25,
    standardDurationMonths: 24,
    mapEmbedUrl: 'https://maps.google.com/maps?q=DHQ+Hospital+Narowal&t=&z=14&ie=UTF8&iwloc=&output=embed'
  },
  {
    id: 'soc-nwl-3',
    name: 'Royal Palm City Narowal',
    societyCode: 'RPC',
    societyIdCode: 'SOC-0003',
    city: 'Narowal',
    district: 'Narowal',
    location: 'New Shakargarh Road, Near Narowal Sports Complex, Narowal',
    totalPlots: 34,
    availablePlots: 21, // 61.7%
    reservedPlots: 7,   // 20.5%
    soldPlots: 5,       // 14.7% (1 under dispute = 2.9%)
    heroImage: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1000',
    description: 'Modern master-planned community with lush green sports complex, educational campus, and flexible 3-year easy installment schedules designed for overseas and local families in Narowal.',
    amenities: ['Sports Complex', 'Educational Campus', 'CCTV Surveillance', 'Water Filtration Plant', 'Wide Carpeted Roads', 'Solar Street Lights'],
    approvalStatus: 'approved',
    contactPhone: '+92 322 7788990',
    nocNumber: 'TMA-NWL/NOC/2024/082',
    nocDocUrl: 'https://manziliq.pk/docs/noc-royalpalm-narowal.pdf',
    secpDocUrl: 'https://manziliq.pk/docs/secp-royalpalm.pdf',
    lateFeePercent: 2.0,
    downPaymentPercent: 15,
    standardDurationMonths: 48,
    mapEmbedUrl: 'https://maps.google.com/maps?q=Sports+City+Narowal&t=&z=14&ie=UTF8&iwloc=&output=embed'
  },
  {
    id: 'soc-nwl-4',
    name: 'Green Valley Enclave Shakargarh',
    societyCode: 'GVE',
    societyIdCode: 'SOC-0004',
    city: 'Shakargarh',
    district: 'Narowal',
    location: 'Canal Expressway, Tehsil Shakargarh, District Narowal',
    totalPlots: 30,
    availablePlots: 18, // 60%
    reservedPlots: 6,   // 20%
    soldPlots: 5,       // 16.6% (1 under dispute = 3.3%)
    heroImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1000',
    description: 'Peaceful suburban enclave in Shakargarh Tehsil with scenic countryside views, modern utilities, and low down-payment entry options for budget-conscious buyers and overseas Pakistanis.',
    amenities: ['Solar Street Lights', 'Boundary Wall', 'Club House', 'Clean Water Plant', '24/7 Security'],
    approvalStatus: 'approved',
    contactPhone: '+92 345 6677889',
    nocNumber: 'TMA-SKG/NOC/2024/014',
    nocDocUrl: 'https://manziliq.pk/docs/noc-greenvalley-shakargarh.pdf',
    secpDocUrl: 'https://manziliq.pk/docs/secp-greenvalley.pdf',
    lateFeePercent: 2.0,
    downPaymentPercent: 20,
    standardDurationMonths: 36,
    mapEmbedUrl: 'https://maps.google.com/maps?q=Shakargarh+Narowal+Punjab&t=&z=13&ie=UTF8&iwloc=&output=embed'
  }
];

// Helper to generate plots for a society with auto-assigned unique category prefix IDs
export function generateSocietyPlots(
  socId: string, 
  socName: string, 
  count: number, 
  codePrefix: string,
  baseRatePerMarla: number
): Plot[] {
  const plots: Plot[] = [];
  const blocks = ['Executive Block', 'Overseas Block', 'Commercial Hub'];
  const sizes = [3, 5, 7, 10, 20]; // 20 Marla = 1 Kanal

  let rplCounter = 0;
  let cplCounter = 0;

  for (let i = 1; i <= count; i++) {
    const padNum = i < 10 ? `0${i}` : `${i}`;
    const plotNumber = `${codePrefix}-${padNum}`;
    const block = i <= Math.floor(count * 0.45) 
      ? blocks[0] 
      : (i <= Math.floor(count * 0.8) ? blocks[1] : blocks[2]);
    const isCommercial = block === 'Commercial Hub';
    
    // Auto-Generate Concurrency-Safe Prefix ID
    const catPrefix = isCommercial ? 'CPL' : 'RPL';
    const seqNum = isCommercial ? ++cplCounter : ++rplCounter;
    const uniquePropertyId = `${codePrefix}-${catPrefix}-${String(seqNum).padStart(4, '0')}`;

    // Pick size
    let sizeMarla = 5;
    if (isCommercial) {
      sizeMarla = i % 2 === 0 ? 4 : 8;
    } else {
      if (i % 5 === 0) sizeMarla = 20; // 1 Kanal
      else if (i % 4 === 0) sizeMarla = 10;
      else if (i % 3 === 0) sizeMarla = 7;
      else if (i % 2 === 0) sizeMarla = 3;
      else sizeMarla = 5;
    }

    const isCorner = i % 7 === 0;
    const isBoulevard = i % 6 === 0;
    const isParkFacing = i % 5 === 0;

    let rate = baseRatePerMarla;
    if (isCommercial) rate = baseRatePerMarla * 2.2;
    if (isCorner) rate *= 1.10;
    if (isBoulevard) rate *= 1.15;

    const pricePKR = Math.round(sizeMarla * rate);
    const downPaymentPKR = Math.round(pricePKR * 0.20);
    const monthlyInstallmentPKR = Math.round((pricePKR - downPaymentPKR) / 36);

    // Status distribution: ~60% available, ~20% reserved, ~15% sold, ~5% disputed
    let status: 'available' | 'reserved' | 'sold' | 'disputed' = 'available';
    let isDisputed = false;
    let disputeReason: string | undefined = undefined;

    if (i % 20 === 0) {
      status = 'disputed';
      isDisputed = true;
      disputeReason = 'Title demarcation discrepancy registered with Tehsil Land Revenue Office.';
    } else if (i % 6 === 0 || i % 7 === 0) {
      status = 'sold';
    } else if (i % 4 === 0 || i % 9 === 0) {
      status = 'reserved';
    } else {
      status = 'available';
    }

    const features: string[] = [];
    if (isBoulevard) features.push('100ft Main Boulevard');
    else features.push('40ft Paved Road');
    if (isCorner) features.push('Corner Plot');
    if (isParkFacing) features.push('Park Facing');
    if (isCommercial) features.push('Direct Commercial Arcade Access');
    features.push('Underground Electricity');

    // SVG coordinate mapping
    const col = (i - 1) % 8;
    const row = Math.floor((i - 1) / 8);

    plots.push({
      id: `plot-${socId}-${i}`,
      propertyId: uniquePropertyId,
      plotCode: uniquePropertyId,
      societyId: socId,
      societyName: socName,
      plotNumber,
      sector: `Sector ${String.fromCharCode(65 + Math.floor((i - 1) / 12))}`,
      block,
      sizeMarla,
      sizeUnit: sizeMarla === 20 ? 'Kanal' : 'Marla',
      sizeSqFt: sizeMarla * 225,
      pricePKR,
      basePrice: pricePKR,
      downPaymentPKR,
      monthlyInstallmentPKR,
      installmentMonths: 36,
      status,
      category: isCommercial ? 'commercial' : 'residential',
      dimensions: isCommercial ? '20x45' : (sizeMarla === 20 ? '50x90' : (sizeMarla === 10 ? '35x65' : (sizeMarla === 7 ? '30x55' : '25x45'))),
      features,
      coordinates: { x: col + 1, y: row + 1 },
      svgZoneId: `zone-${socId}-${plotNumber}`,
      dealerId: i % 3 === 0 ? 'u-dealer-1' : (i % 3 === 1 ? 'u-dealer-2' : 'u-dealer-3'),
      dealerName: i % 3 === 0 ? 'Chaudhry Tariq Real Estate' : (i % 3 === 1 ? 'Bismillah Property Network' : 'Al-Madina Estate'),
      isLocked: status === 'reserved',
      isDisputed,
      disputeReason
    });
  }

  return plots;
}

// Generate all 140 plots across 4 Narowal societies
export const SEED_PLOTS: Plot[] = [
  ...generateSocietyPlots('soc-nwl-1', 'Al-Rehman Garden Narowal', 40, 'ARG', 550000),   // Avg PKR 5.5 Lakh / Marla
  ...generateSocietyPlots('soc-nwl-2', 'Model City Housing Narowal', 36, 'MCH', 620000),  // Avg PKR 6.2 Lakh / Marla
  ...generateSocietyPlots('soc-nwl-3', 'Royal Palm City Narowal', 34, 'RPC', 480000),    // Avg PKR 4.8 Lakh / Marla
  ...generateSocietyPlots('soc-nwl-4', 'Green Valley Enclave Shakargarh', 30, 'GVE', 380000) // Avg PKR 3.8 Lakh / Marla
];

// ==============================================================================
// 3. MARKETPLACE PROPERTY LISTINGS (30 Featured Properties)
// ==============================================================================
export const SEED_PROPERTIES: Property[] = SEED_PLOTS.slice(0, 30).map((plot, idx) => {
  const images = [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000'
  ];

  const prefix = plot.category === 'commercial' ? 'CPL' : 'RPL';

  return {
    id: `prop-nwl-${idx + 1}`,
    propertyId: plot.propertyId || `ARG-${prefix}-${String(idx + 1).padStart(4, '0')}`,
    categoryPrefix: prefix,
    title: `${plot.sizeMarla} Marla ${plot.category === 'commercial' ? 'Commercial' : 'Residential'} Plot - ${plot.plotNumber}`,
    type: plot.category === 'commercial' ? 'commercial' : 'plot',
    pricePKR: plot.pricePKR,
    sizeMarla: plot.sizeMarla,
    sizeSqFt: plot.sizeSqFt,
    pricePerMarla: Math.round(plot.pricePKR / plot.sizeMarla),
    sector: plot.sector,
    block: plot.block,
    plotNumber: plot.plotNumber,
    roadWidth: plot.features.some(f => f.includes('Boulevard')) ? '100ft Main Boulevard' : '40ft Paved Street',
    category: plot.category === 'commercial' ? 'Commercial Plot' : 'Residential Plot',
    location: `${plot.block}, ${plot.societyName}, District Narowal`,
    city: 'Narowal',
    societyId: plot.societyId,
    societyName: plot.societyName,
    dealerId: plot.dealerId || 'u-dealer-1',
    dealerName: plot.dealerName || 'Chaudhry Tariq Real Estate',
    images,
    description: `Direct LDA & TMA verified plot with immediate possession and registry clearance. Located in ${plot.block}, ${plot.societyName} on ${plot.features.join(', ')}.`,
    amenities: plot.features,
    featured: idx < 8,
    status: 'approved',
    verificationStatus: 'verified',
    listingStatus: plot.status as any,
    paymentPlan: {
      installmentsAvailable: true,
      downPaymentPercent: 20,
      downPaymentPKR: plot.downPaymentPKR,
      installmentMonths: 36,
      monthlyAmountPKR: plot.monthlyInstallmentPKR
    },
    createdAt: '2026-02-15'
  };
});

// ==============================================================================
// 4. ACTIVE BOOKINGS & DEALS (12 Customers at Different Pipeline Stages)
// ==============================================================================
export const SEED_BOOKINGS: Booking[] = [
  // Stage 5: Active Installments (Buyer 1 - Muhammad Farooq)
  {
    id: 'book-nwl-101',
    bookingReference: 'PROP-2026-ARG-001',
    buyerId: 'u-buyer-1',
    buyerName: 'Muhammad Farooq',
    buyerEmail: 'farooq.buyer@gmail.com',
    buyerPhone: '+92 300 8472910',
    buyerCnic: '34501-8472910-3',
    plotId: 'plot-soc-nwl-1-1',
    plotNumber: 'ARG-01',
    sector: 'Sector A',
    societyId: 'soc-nwl-1',
    societyName: 'Al-Rehman Garden Narowal',
    totalPricePKR: 2750000,
    downPaymentPKR: 550000,
    tokenAdvancePKR: 100000,
    monthlyInstallmentPKR: 61111,
    totalInstallments: 36,
    installmentPlanType: '3_year',
    status: 'approved',
    pipelineStage: 5,
    bookingDate: '2026-01-10',
    dealerId: 'u-dealer-1',
    dealerName: 'Chaudhry Tariq Real Estate',
    allotmentLetterNumber: 'ARG-NWL-ALT-2026-042',
    isAutoLocked: true,
    lockedAt: '2026-01-10T10:30:00Z',
    timeline: [
      { stage: 1, label: 'Inquiry Submitted', timestamp: '2026-01-08', completed: true },
      { stage: 2, label: 'Site Walkthrough Scheduled', timestamp: '2026-01-09', completed: true },
      { stage: 3, label: 'Token Advance of PKR 100,000 Verified via Raast', timestamp: '2026-01-10', completed: true },
      { stage: 4, label: 'Legal Sale Agreement Signed & Sealed', timestamp: '2026-01-18', completed: true },
      { stage: 5, label: 'Active Monthly Installments Ongoing (4 of 36 Cleared)', timestamp: '2026-02-01', completed: true },
      { stage: 6, label: 'Final Intiqal Title Registry Transfer', completed: false }
    ]
  },

  // Stage 3: Token Advance Submitted, In Escrow Review (Buyer 2 - Dr. Naveed Iqbal)
  {
    id: 'book-nwl-102',
    bookingReference: 'PROP-2026-ARG-004',
    buyerId: 'u-buyer-2',
    buyerName: 'Dr. Naveed Iqbal',
    buyerEmail: 'dr.naveed.iqbal@gmail.com',
    buyerPhone: '+92 301 9876543',
    buyerCnic: '34501-9876543-1',
    plotId: 'plot-soc-nwl-1-4',
    plotNumber: 'ARG-04',
    sector: 'Sector A',
    societyId: 'soc-nwl-1',
    societyName: 'Al-Rehman Garden Narowal',
    totalPricePKR: 3850000,
    downPaymentPKR: 770000,
    tokenAdvancePKR: 150000,
    monthlyInstallmentPKR: 85555,
    totalInstallments: 36,
    status: 'pending',
    pipelineStage: 3,
    bookingDate: '2026-02-20',
    dealerId: 'u-dealer-1',
    dealerName: 'Chaudhry Tariq Real Estate',
    isAutoLocked: true,
    lockedAt: '2026-02-20T14:15:00Z',
    timeline: [
      { stage: 1, label: 'Inquiry Submitted', timestamp: '2026-02-18', completed: true },
      { stage: 2, label: 'Physical Plot Inspection Done', timestamp: '2026-02-19', completed: true },
      { stage: 3, label: 'Token Advance Deposit Pending Admin Verification', timestamp: '2026-02-20', completed: true },
      { stage: 4, label: 'Sale Agreement Execution', completed: false },
      { stage: 5, label: 'Installments Initiation', completed: false },
      { stage: 6, label: 'Final Title Deed', completed: false }
    ]
  },

  // Stage 6: Completed Allotment & Intiqal Registry (Buyer 4 - Mian Tahir Mahmood)
  {
    id: 'book-nwl-103',
    bookingReference: 'PROP-2026-MCH-006',
    buyerId: 'u-buyer-4',
    buyerName: 'Mian Tahir Mahmood',
    buyerEmail: 'tahir.mahmood@transworld.pk',
    buyerPhone: '+92 333 9988112',
    buyerCnic: '34501-9988112-9',
    plotId: 'plot-soc-nwl-2-6',
    plotNumber: 'MCH-06',
    sector: 'Sector A',
    societyId: 'soc-nwl-2',
    societyName: 'Model City Housing Narowal',
    totalPricePKR: 6200000,
    downPaymentPKR: 1550000,
    tokenAdvancePKR: 200000,
    monthlyInstallmentPKR: 0,
    totalInstallments: 1,
    installmentPlanType: 'lump_sum',
    status: 'completed',
    pipelineStage: 6,
    bookingDate: '2025-11-15',
    dealerId: 'u-dealer-2',
    dealerName: 'Bismillah Property Network Narowal',
    allotmentLetterNumber: 'MCH-NWL-ALT-2025-881',
    transferDeedNumber: 'INTIQAL-NWL-2026-10492',
    possessionDate: '2026-01-15',
    timeline: [
      { stage: 1, label: 'Inquiry Submitted', timestamp: '2025-11-10', completed: true },
      { stage: 2, label: 'Site Demarcation Walkthrough', timestamp: '2025-11-12', completed: true },
      { stage: 3, label: 'Token Advance Cleared', timestamp: '2025-11-15', completed: true },
      { stage: 4, label: 'Sale Agreement Executed', timestamp: '2025-11-20', completed: true },
      { stage: 5, label: '100% Lump-Sum Payment Cleared', timestamp: '2025-12-01', completed: true },
      { stage: 6, label: 'Official Intiqal Registry Registered at Tehsil Office', timestamp: '2026-01-15', completed: true }
    ]
  },

  // Stage 4: Sale Agreement Signed (Buyer 3 - Usman Ghani)
  {
    id: 'book-nwl-104',
    bookingReference: 'PROP-2026-RPC-008',
    buyerId: 'u-buyer-3',
    buyerName: 'Usman Ghani',
    buyerEmail: 'usman.ghani.nwl@hotmail.com',
    buyerPhone: '+92 322 1234567',
    buyerCnic: '34501-1234567-7',
    plotId: 'plot-soc-nwl-3-8',
    plotNumber: 'RPC-08',
    sector: 'Sector A',
    societyId: 'soc-nwl-3',
    societyName: 'Royal Palm City Narowal',
    totalPricePKR: 4800000,
    downPaymentPKR: 720000,
    tokenAdvancePKR: 100000,
    monthlyInstallmentPKR: 85000,
    totalInstallments: 48,
    status: 'approved',
    pipelineStage: 4,
    bookingDate: '2026-02-10',
    dealerId: 'u-dealer-3',
    dealerName: 'Al-Madina Estate & Marketing',
    timeline: [
      { stage: 1, label: 'Inquiry Submitted', timestamp: '2026-02-05', completed: true },
      { stage: 2, label: 'Plot Inspection Verified', timestamp: '2026-02-08', completed: true },
      { stage: 3, label: 'Token Deposit Verified', timestamp: '2026-02-10', completed: true },
      { stage: 4, label: 'Sale Agreement Signed on Official Stamp Paper', timestamp: '2026-02-15', completed: true },
      { stage: 5, label: 'Downpayment Challan Pending', completed: false },
      { stage: 6, label: 'Allotment Letter Sealing', completed: false }
    ]
  },

  // Stage 5: Active Installments with Overdue Alert (Buyer 7 - Overseas UK Buyer Kamran Akram)
  {
    id: 'book-nwl-105',
    bookingReference: 'PROP-2026-RPC-012',
    buyerId: 'u-buyer-7',
    buyerName: 'Kamran Akram (Overseas Buyer - UK)',
    buyerEmail: 'kamran.akram.uk@gmail.com',
    buyerPhone: '+44 7700 900123',
    buyerCnic: '34501-3322114-1',
    plotId: 'plot-soc-nwl-3-12',
    plotNumber: 'RPC-12',
    sector: 'Sector B',
    societyId: 'soc-nwl-3',
    societyName: 'Royal Palm City Narowal',
    totalPricePKR: 9600000,
    downPaymentPKR: 1440000,
    tokenAdvancePKR: 250000,
    monthlyInstallmentPKR: 170000,
    totalInstallments: 48,
    status: 'approved',
    pipelineStage: 5,
    bookingDate: '2025-12-01',
    dealerId: 'u-dealer-3',
    dealerName: 'Al-Madina Estate & Marketing',
    allotmentLetterNumber: 'RPC-NWL-ALT-2025-519',
    timeline: [
      { stage: 1, label: 'Overseas Portal Inquiry', timestamp: '2025-11-20', completed: true },
      { stage: 2, label: 'Video Call Virtual Site Tour', timestamp: '2025-11-25', completed: true },
      { stage: 3, label: 'Token Advance Remitted via Swift Wire Transfer', timestamp: '2025-12-01', completed: true },
      { stage: 4, label: 'Digital Power of Attorney & Agreement Registered', timestamp: '2025-12-15', completed: true },
      { stage: 5, label: 'Installments Active (Installment #3 is Due)', timestamp: '2026-01-01', completed: true },
      { stage: 6, label: 'Final Transfer Deed Execution', completed: false }
    ]
  }
];

// ==============================================================================
// 5. INSTALLMENT LEDGER ENTRIES (Paid, Due, Overdue with Late Fees)
// ==============================================================================
export const SEED_INSTALLMENTS: Installment[] = [
  // Installments for Booking 101 (Muhammad Farooq - 4 Paid, 1 Due)
  {
    id: 'inst-nwl-101-1',
    bookingId: 'book-nwl-101',
    bookingReference: 'PROP-2026-ARG-001',
    installmentNumber: 1,
    dueDate: '2026-01-20',
    amountPKR: 61111,
    status: 'paid',
    paidDate: '2026-01-19',
    paidAt: '2026-01-19T11:00:00Z',
    paymentMethod: 'JazzCash',
    transactionId: 'JC-NWL-94827104',
    receiptNumber: 'REC-ARG-2026-001',
    challanNumber: 'CHL-ARG-2026-001',
    plotNumber: 'ARG-01',
    societyName: 'Al-Rehman Garden Narowal'
  },
  {
    id: 'inst-nwl-101-2',
    bookingId: 'book-nwl-101',
    bookingReference: 'PROP-2026-ARG-001',
    installmentNumber: 2,
    dueDate: '2026-02-20',
    amountPKR: 61111,
    status: 'paid',
    paidDate: '2026-02-18',
    paidAt: '2026-02-18T15:30:00Z',
    paymentMethod: 'EasyPaisa',
    transactionId: 'EP-NWL-83719024',
    receiptNumber: 'REC-ARG-2026-002',
    challanNumber: 'CHL-ARG-2026-002',
    plotNumber: 'ARG-01',
    societyName: 'Al-Rehman Garden Narowal'
  },
  {
    id: 'inst-nwl-101-3',
    bookingId: 'book-nwl-101',
    bookingReference: 'PROP-2026-ARG-001',
    installmentNumber: 3,
    dueDate: '2026-03-20',
    amountPKR: 61111,
    status: 'due',
    challanNumber: 'CHL-ARG-2026-003',
    plotNumber: 'ARG-01',
    societyName: 'Al-Rehman Garden Narowal'
  },

  // Installments for Booking 105 (Overseas UK Buyer - 1 Paid, 1 Overdue, 1 Due)
  {
    id: 'inst-nwl-105-1',
    bookingId: 'book-nwl-105',
    bookingReference: 'PROP-2026-RPC-012',
    installmentNumber: 1,
    dueDate: '2026-01-05',
    amountPKR: 170000,
    status: 'paid',
    paidDate: '2026-01-04',
    paymentMethod: 'Bank Transfer',
    transactionId: 'HBL-FT-99281726',
    receiptNumber: 'REC-RPC-2026-101',
    challanNumber: 'CHL-RPC-2026-101',
    plotNumber: 'RPC-12',
    societyName: 'Royal Palm City Narowal'
  },
  {
    id: 'inst-nwl-105-2',
    bookingId: 'book-nwl-105',
    bookingReference: 'PROP-2026-RPC-012',
    installmentNumber: 2,
    dueDate: '2026-02-05',
    amountPKR: 170000,
    lateFeePKR: 4250,
    daysOverdue: 20,
    status: 'overdue',
    challanNumber: 'CHL-RPC-2026-102',
    plotNumber: 'RPC-12',
    societyName: 'Royal Palm City Narowal',
    reminderSentAt: '2026-02-15'
  },
  {
    id: 'inst-nwl-105-3',
    bookingId: 'book-nwl-105',
    bookingReference: 'PROP-2026-RPC-012',
    installmentNumber: 3,
    dueDate: '2026-03-05',
    amountPKR: 170000,
    status: 'due',
    challanNumber: 'CHL-RPC-2026-103',
    plotNumber: 'RPC-12',
    societyName: 'Royal Palm City Narowal'
  }
];

// ==============================================================================
// 6. DEALER LOT ASSIGNMENTS & INQUIRIES
// ==============================================================================
export const SEED_LOT_ASSIGNMENTS: LotAssignment[] = [
  {
    id: 'lot-nwl-001',
    lotNumber: 'LOT-ARG-2026-A1',
    societyId: 'soc-nwl-1',
    societyName: 'Al-Rehman Garden Narowal',
    block: 'Executive Block',
    dealerId: 'u-dealer-1',
    dealerName: 'Chaudhry Tariq Real Estate',
    dealerLicense: 'REA-NWL-2024-101',
    dealerPhone: '+92 321 9847201',
    plotIds: ['plot-soc-nwl-1-1', 'plot-soc-nwl-1-2', 'plot-soc-nwl-1-3', 'plot-soc-nwl-1-4'],
    plotNumbers: ['ARG-01', 'ARG-02', 'ARG-03', 'ARG-04'],
    assignedDate: '2026-01-01',
    expiryDate: '2026-06-30',
    status: 'active',
    commissionPercent: 2.5,
    assignedBy: 'Engr. Tariq Mehmood (Society Admin)',
    notes: 'Exclusive authorization for 5 Marla Executive plots near Grand Mosque.'
  },
  {
    id: 'lot-nwl-002',
    lotNumber: 'LOT-MCH-2026-B1',
    societyId: 'soc-nwl-2',
    societyName: 'Model City Housing Narowal',
    block: 'Overseas Block',
    dealerId: 'u-dealer-2',
    dealerName: 'Bismillah Property Network Narowal',
    dealerLicense: 'REA-NWL-2023-045',
    dealerPhone: '+92 333 4455667',
    plotIds: ['plot-soc-nwl-2-5', 'plot-soc-nwl-2-6', 'plot-soc-nwl-2-7'],
    plotNumbers: ['MCH-05', 'MCH-06', 'MCH-07'],
    assignedDate: '2026-01-15',
    expiryDate: '2026-07-15',
    status: 'active',
    commissionPercent: 2.0,
    assignedBy: 'Ch. Zulfiqar Ali (Society Admin)'
  },
  {
    id: 'lot-nwl-003',
    lotNumber: 'LOT-RPC-2026-C1',
    societyId: 'soc-nwl-3',
    societyName: 'Royal Palm City Narowal',
    block: 'Commercial Hub',
    dealerId: 'u-dealer-3',
    dealerName: 'Al-Madina Estate & Marketing',
    dealerLicense: 'REA-NWL-2024-078',
    dealerPhone: '+92 300 7654321',
    plotIds: ['plot-soc-nwl-3-8', 'plot-soc-nwl-3-9', 'plot-soc-nwl-3-10'],
    plotNumbers: ['RPC-08', 'RPC-09', 'RPC-10'],
    assignedDate: '2026-02-01',
    expiryDate: '2026-08-01',
    status: 'active',
    commissionPercent: 3.0,
    assignedBy: 'Brig. (R) Asim Javed (Society Admin)'
  }
];

export const SEED_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-nwl-101',
    propertyId: 'prop-nwl-1',
    propertyTitle: '5 Marla Residential Plot - ARG-01',
    societyName: 'Al-Rehman Garden Narowal',
    senderName: 'Muhammad Farooq',
    senderPhone: '+92 300 8472910',
    senderEmail: 'farooq.buyer@gmail.com',
    buyerId: 'u-buyer-1',
    assignedDealerId: 'u-dealer-1',
    assignedDealerName: 'Chaudhry Tariq Real Estate',
    message: 'Salam, I would like to schedule a physical plot demarcation walkthrough this Saturday afternoon.',
    date: '2026-02-23',
    status: 'visit_scheduled',
    scheduledVisitDate: '2026-08-28',
    responseTimeMinutes: 12,
    messages: [
      { id: 'm-1', sender: 'buyer', senderName: 'Muhammad Farooq', text: 'Is this 5 Marla plot ready for immediate construction?', time: '2026-02-23 10:15 AM' },
      { id: 'm-2', sender: 'dealer', senderName: 'Chaudhry Tariq', text: 'Yes, possession and gas/electricity meters are readily available. Walkthrough scheduled for Aug 28.', time: '2026-02-23 10:27 AM' }
    ]
  },
  {
    id: 'inq-nwl-102',
    propertyId: 'prop-nwl-4',
    propertyTitle: '10 Marla Boulevard Plot - ARG-04',
    societyName: 'Al-Rehman Garden Narowal',
    senderName: 'Dr. Naveed Iqbal',
    senderPhone: '+92 301 9876543',
    senderEmail: 'dr.naveed.iqbal@gmail.com',
    buyerId: 'u-buyer-2',
    assignedDealerId: 'u-dealer-1',
    assignedDealerName: 'Chaudhry Tariq Real Estate',
    message: 'Can you provide the verified Aks Shajra and confirmed Khasra number for this boulevard plot?',
    date: '2026-02-24',
    status: 'in_discussion',
    responseTimeMinutes: 8,
    messages: [
      { id: 'm-3', sender: 'buyer', senderName: 'Dr. Naveed Iqbal', text: 'Please send Khasra reference and TMA approval certificate.', time: '2026-02-24 02:00 PM' }
    ]
  }
];

// ==============================================================================
// 7. MULTI-CHANNEL NOTIFICATIONS (In-App, Push, SMS, Email)
// ==============================================================================
export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-nwl-101',
    userId: 'u-buyer-1',
    user_id: 'u-buyer-1',
    role: 'buyer',
    recipientName: 'Muhammad Farooq',
    recipientPhone: '+92 300 8472910',
    recipientEmail: 'farooq.buyer@gmail.com',
    type: 'payment',
    title: 'Installment #2 Payment Verified',
    message: 'Your payment of PKR 61,111 for Plot ARG-01 (Receipt # REC-ARG-2026-002) has been verified by Al-Rehman Garden Treasury.',
    channel: 'all',
    channelsSent: ['in_app', 'push', 'sms', 'email'],
    status: 'sent',
    read: false,
    createdAt: '2026-02-18T15:30:00Z',
    smsPreview: 'MANZILIQ: Payment of PKR 61,111 received for Plot ARG-01. Receipt #REC-ARG-2026-002 verified.',
    emailPreview: {
      subject: 'Official Payment Receipt: Plot ARG-01',
      body: 'Dear Muhammad Farooq, your installment payment of PKR 61,111 has been successfully recorded in the society ledger.'
    },
    deliveryLogs: [
      { id: 'log-1', notificationId: 'notif-nwl-101', channel: 'in_app', recipient: 'u-buyer-1', status: 'delivered', timestamp: '2026-02-18T15:30:01Z' },
      { id: 'log-2', notificationId: 'notif-nwl-101', channel: 'push', recipient: 'FCM-TOKEN-Farooq', status: 'delivered', timestamp: '2026-02-18T15:30:02Z' },
      { id: 'log-3', notificationId: 'notif-nwl-101', channel: 'sms', recipient: '+92 300 8472910', status: 'delivered', providerResponse: 'TELCO-OK-9948', timestamp: '2026-02-18T15:30:04Z' },
      { id: 'log-4', notificationId: 'notif-nwl-101', channel: 'email', recipient: 'farooq.buyer@gmail.com', status: 'delivered', timestamp: '2026-02-18T15:30:05Z' }
    ]
  },
  {
    id: 'notif-nwl-102',
    userId: 'u-buyer-7',
    user_id: 'u-buyer-7',
    role: 'buyer',
    recipientName: 'Kamran Akram (Overseas Buyer)',
    recipientPhone: '+44 7700 900123',
    recipientEmail: 'kamran.akram.uk@gmail.com',
    type: 'installment',
    title: 'Urgent: Overdue Installment Reminder',
    message: 'Installment #2 for Plot RPC-12 (PKR 170,000) was due on Feb 05, 2026. A late fee of PKR 4,250 has been applied.',
    channel: 'all',
    channelsSent: ['in_app', 'push', 'sms', 'email'],
    status: 'sent',
    read: false,
    createdAt: '2026-02-15T09:00:00Z',
    smsPreview: 'MANZILIQ Alert: Installment #2 for Plot RPC-12 is 10 days overdue. Pay via 1Link/Raast to avoid suspension.',
    deliveryLogs: [
      { id: 'log-5', notificationId: 'notif-nwl-102', channel: 'in_app', recipient: 'u-buyer-7', status: 'delivered', timestamp: '2026-02-15T09:00:01Z' },
      { id: 'log-6', notificationId: 'notif-nwl-102', channel: 'push', recipient: 'FCM-TOKEN-Kamran', status: 'delivered', timestamp: '2026-02-15T09:00:02Z' },
      { id: 'log-7', notificationId: 'notif-nwl-102', channel: 'sms', recipient: '+44 7700 900123', status: 'failed', errorMessage: 'International SMS route carrier timeout', timestamp: '2026-02-15T09:00:05Z' },
      { id: 'log-8', notificationId: 'notif-nwl-102', channel: 'email', recipient: 'kamran.akram.uk@gmail.com', status: 'delivered', timestamp: '2026-02-15T09:00:06Z' }
    ]
  },
  {
    id: 'notif-nwl-103',
    userId: 'u-dealer-1',
    user_id: 'u-dealer-1',
    role: 'dealer',
    recipientName: 'Chaudhry Tariq Real Estate',
    recipientPhone: '+92 321 9847201',
    recipientEmail: 'tariq.realtor@manziliq.pk',
    type: 'inquiry',
    title: 'New Site Walkthrough Scheduled',
    message: 'Buyer Muhammad Farooq has scheduled a physical site inspection for Plot ARG-01 on Aug 28, 2026.',
    channel: 'in_app',
    status: 'sent',
    read: true,
    createdAt: '2026-02-23T10:30:00Z'
  },
  {
    id: 'notif-nwl-104',
    userId: 'u-admin-1',
    user_id: 'u-admin-1',
    role: 'super_admin',
    recipientName: 'Ayesha Shoukat (Super Admin)',
    type: 'dispute',
    title: 'Title Demarcation Dispute Logged',
    message: 'Tehsil Land Revenue Office has placed Plot RPC-20 under dispute review. Plot has been frozen from public marketplace.',
    channel: 'in_app',
    status: 'sent',
    read: false,
    createdAt: '2026-02-24T12:00:00Z'
  }
];

// ==============================================================================
// 8. DOCUMENT LOCKER ITEMS (Certified Land & Allotment Dossiers)
// ==============================================================================
export const SEED_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-nwl-1',
    title: 'Official Provisional Allotment Certificate - Plot ARG-01',
    type: 'allotment_letter',
    category: 'allotment',
    bookingId: 'book-nwl-101',
    bookingReference: 'PROP-2026-ARG-001',
    buyerId: 'u-buyer-1',
    buyerName: 'Muhammad Farooq',
    buyerCnic: '34501-8472910-3',
    plotNumber: 'ARG-01',
    sector: 'Sector A',
    societyName: 'Al-Rehman Garden Narowal',
    issueDate: '2026-01-18',
    fileUrl: 'https://manziliq.pk/docs/allotment-arg-01.pdf',
    fileSize: '2.4 MB',
    verifiedStamp: true,
    verified: true,
    verificationCode: 'VRF-ARG-2026-9948',
    tamperProofHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    signatories: [
      { role: 'Town Planning Director', name: 'Engr. Tariq Mehmood', signedAt: '2026-01-18T10:00:00Z', status: 'signed' },
      { role: 'Tehsil Registrar Delegate', name: 'Ch. M. Aslam', signedAt: '2026-01-18T11:30:00Z', status: 'signed' }
    ]
  },
  {
    id: 'doc-nwl-2',
    title: 'Certified Aks Shajra & Demarcation Plan - Model City',
    type: 'noc_certificate',
    category: 'noc',
    societyName: 'Model City Housing Narowal',
    issueDate: '2025-08-10',
    fileUrl: 'https://manziliq.pk/docs/aks-shajra-modelcity.pdf',
    fileSize: '4.8 MB',
    verifiedStamp: true,
    verified: true,
    verificationCode: 'TMA-NWL-SHJ-2025-411',
    tamperProofHash: 'a8f5f167f44f4964e6c998dee827110c0340c495991b7852b855e3b0c44298fc'
  },
  {
    id: 'doc-nwl-3',
    title: 'Registered Intiqal Title Deed - Plot MCH-06',
    type: 'transfer_deed',
    category: 'title_deed',
    bookingId: 'book-nwl-103',
    bookingReference: 'PROP-2026-MCH-006',
    buyerId: 'u-buyer-4',
    buyerName: 'Mian Tahir Mahmood',
    buyerCnic: '34501-9988112-9',
    plotNumber: 'MCH-06',
    societyName: 'Model City Housing Narowal',
    issueDate: '2026-01-15',
    fileUrl: 'https://manziliq.pk/docs/intiqal-mch-06.pdf',
    fileSize: '3.1 MB',
    verifiedStamp: true,
    verified: true,
    verificationCode: 'INTIQAL-NWL-2026-10492'
  }
];

// ==============================================================================
// 9. DISPUTES & REGULATORY FREEZES
// ==============================================================================
export const SEED_DISPUTES: Dispute[] = [
  {
    id: 'disp-nwl-1',
    plotId: 'plot-soc-nwl-1-20',
    plotNumber: 'ARG-20',
    societyId: 'soc-nwl-1',
    societyName: 'Al-Rehman Garden Narowal',
    complainantName: 'Mian Altaf Hussain',
    complainantRole: 'buyer',
    respondentName: 'Chaudhry Tariq Real Estate',
    respondentRole: 'dealer',
    type: 'boundary_dispute',
    status: 'frozen',
    createdAt: '2026-02-10',
    description: 'Boundary measurement overlap with adjoining agricultural Khasra number 412/18. Society surveyor dispatched.',
    notes: [
      { author: 'Ayesha Shoukat (Super Admin)', date: '2026-02-11', text: 'Plot frozen from public marketplace. TMA Narowal surveyor summoned for field re-measurement.' }
    ]
  },
  {
    id: 'disp-nwl-2',
    plotId: 'plot-soc-nwl-3-20',
    plotNumber: 'RPC-20',
    societyId: 'soc-nwl-3',
    societyName: 'Royal Palm City Narowal',
    complainantName: 'Sardar Farooq Virk',
    complainantRole: 'buyer',
    respondentName: 'Royal Palm City Management',
    respondentRole: 'society_admin',
    type: 'title_conflict',
    status: 'under_mediation',
    createdAt: '2026-02-18',
    description: 'Claim of pre-existing ancestral inheritance title over Khasra demarcation before society acquisition.',
    notes: [
      { author: 'Punjab Land Authority Auditor', date: '2026-02-19', text: 'Revenue record Moza Zafarwal requested from Sub-Registrar Office.' }
    ]
  }
];
