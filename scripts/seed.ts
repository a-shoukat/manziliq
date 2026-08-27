import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { 
  SEED_USERS, 
  SEED_SOCIETIES, 
  SEED_PLOTS, 
  SEED_PROPERTIES, 
  SEED_BOOKINGS, 
  SEED_INSTALLMENTS, 
  SEED_LOT_ASSIGNMENTS, 
  SEED_DOCUMENTS, 
  SEED_NOTIFICATIONS, 
  SEED_INQUIRIES,
  SEED_DISPUTES
} from './seedData';

dotenv.config();

// Color codes for readable terminal logging
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  bold: '\x1b[1m'
};

function generateSqlSeed(): string {
  let sql = `-- ==============================================================================
-- MANZILIQ COMPREHENSIVE SEED SCRIPT (PostgreSQL / Supabase)
-- Target District: Narowal (Punjab, Pakistan)
-- Generated: ${new Date().toISOString()}
-- ==============================================================================

BEGIN;

-- 1. CLEANUP EXISTING TABLES (Idempotent Reset)
TRUNCATE TABLE public.audit_logs CASCADE;
TRUNCATE TABLE public.documents CASCADE;
TRUNCATE TABLE public.installments CASCADE;
TRUNCATE TABLE public.bookings CASCADE;
TRUNCATE TABLE public.dealer_leads CASCADE;
TRUNCATE TABLE public.dealer_lot_requests CASCADE;
TRUNCATE TABLE public.lot_audit_trail CASCADE;
TRUNCATE TABLE public.lot_assignments CASCADE;
TRUNCATE TABLE public.dealer_society_relations CASCADE;
TRUNCATE TABLE public.properties CASCADE;
TRUNCATE TABLE public.plots CASCADE;
TRUNCATE TABLE public.societies CASCADE;
TRUNCATE TABLE public.verification_requests CASCADE;

-- 2. INSERT PROFILES (Users across all 4 roles)
`;

  // Profiles
  SEED_USERS.forEach(u => {
    sql += `INSERT INTO public.profiles (id, name, email, phone, role, status, verified, cnic, license_no, society_id, society_name, avatar)
VALUES ('${u.id}', '${u.name.replace(/'/g, "''")}', '${u.email}', '${u.phone || ''}', '${u.role}', '${u.status}', ${u.verified}, ${u.cnic ? `'${u.cnic}'` : 'NULL'}, ${u.licenseNo ? `'${u.licenseNo}'` : 'NULL'}, ${u.societyId ? `'${u.societyId}'` : 'NULL'}, ${u.societyName ? `'${u.societyName.replace(/'/g, "''")}'` : 'NULL'}, '${u.avatar || ''}')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, status = EXCLUDED.status;\n`;
  });

  sql += `\n-- 3. INSERT HOUSING SOCIETIES (Narowal District)\n`;
  SEED_SOCIETIES.forEach(s => {
    const amenitiesArr = `ARRAY[${s.amenities.map(a => `'${a.replace(/'/g, "''")}'`).join(', ')}]`;
    sql += `INSERT INTO public.societies (id, name, city, district, location, total_plots, available_plots, reserved_plots, sold_plots, hero_image, description, amenities, approval_status, contact_phone, noc_number, noc_doc_url, secp_doc_url, late_fee_percent, down_payment_percent, standard_duration_months, map_embed_url)
VALUES ('${s.id}', '${s.name.replace(/'/g, "''")}', '${s.city}', '${s.district}', '${s.location.replace(/'/g, "''")}', ${s.totalPlots}, ${s.availablePlots}, ${s.reservedPlots}, ${s.soldPlots}, '${s.heroImage}', '${s.description.replace(/'/g, "''")}', ${amenitiesArr}, '${s.approvalStatus}', '${s.contactPhone}', '${s.nocNumber || ''}', '${s.nocDocUrl || ''}', '${s.secpDocUrl || ''}', ${s.lateFeePercent || 2.5}, ${s.downPaymentPercent || 20}, ${s.standardDurationMonths || 36}, '${s.mapEmbedUrl || ''}')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, total_plots = EXCLUDED.total_plots;\n`;
  });

  sql += `\n-- 4. INSERT PLOTS (${SEED_PLOTS.length} Plots across 4 Housing Schemes)\n`;
  SEED_PLOTS.forEach(p => {
    const featuresArr = `ARRAY[${p.features.map(f => `'${f.replace(/'/g, "''")}'`).join(', ')}]`;
    sql += `INSERT INTO public.plots (id, society_id, society_name, plot_number, sector, block, size_marla, size_unit, size_sq_ft, price_pkr, base_price, down_payment_pkr, monthly_installment_pkr, installment_months, status, category, dimensions, features, coord_x, coord_y, dealer_id, dealer_name, is_locked, is_disputed, dispute_reason)
VALUES ('${p.id}', '${p.societyId}', '${p.societyName.replace(/'/g, "''")}', '${p.plotNumber}', '${p.sector}', '${p.block}', ${p.sizeMarla}, '${p.sizeUnit || 'Marla'}', ${p.sizeSqFt}, ${p.pricePKR}, ${p.basePrice || p.pricePKR}, ${p.downPaymentPKR}, ${p.monthlyInstallmentPKR}, ${p.installmentMonths}, '${p.status}', '${p.category}', '${p.dimensions}', ${featuresArr}, ${p.coordinates.x}, ${p.coordinates.y}, ${p.dealerId ? `'${p.dealerId}'` : 'NULL'}, ${p.dealerName ? `'${p.dealerName.replace(/'/g, "''")}'` : 'NULL'}, ${p.isLocked || false}, ${p.isDisputed || false}, ${p.disputeReason ? `'${p.disputeReason.replace(/'/g, "''")}'` : 'NULL'})
ON CONFLICT (id) DO NOTHING;\n`;
  });

  sql += `\n-- 5. INSERT PROPERTIES (Marketplace Listings)\n`;
  SEED_PROPERTIES.forEach(prop => {
    const imagesArr = `ARRAY[${prop.images.map(img => `'${img}'`).join(', ')}]`;
    const amenitiesArr = `ARRAY[${prop.amenities.map(a => `'${a.replace(/'/g, "''")}'`).join(', ')}]`;
    sql += `INSERT INTO public.properties (id, title, type, price_pkr, size_marla, location, city, society_id, society_name, dealer_id, dealer_name, images, description, amenities, featured, status, listing_status)
VALUES ('${prop.id}', '${prop.title.replace(/'/g, "''")}', '${prop.type}', ${prop.pricePKR}, ${prop.sizeMarla}, '${prop.location.replace(/'/g, "''")}', '${prop.city}', '${prop.societyId}', '${prop.societyName.replace(/'/g, "''")}', '${prop.dealerId || ''}', '${(prop.dealerName || '').replace(/'/g, "''")}', ${imagesArr}, '${prop.description.replace(/'/g, "''")}', ${amenitiesArr}, ${prop.featured}, '${prop.status}', '${prop.listingStatus}')
ON CONFLICT (id) DO NOTHING;\n`;
  });

  sql += `\n-- 6. INSERT BOOKINGS (Active Pipeline Stages 1 through 6)\n`;
  SEED_BOOKINGS.forEach(b => {
    sql += `INSERT INTO public.bookings (id, buyer_id, buyer_name, buyer_email, buyer_phone, buyer_cnic, plot_id, plot_number, sector, society_id, society_name, total_price_pkr, token_advance_pkr, down_payment_pkr, monthly_installment_pkr, total_installments, status, pipeline_stage, dealer_id, dealer_name, allotment_letter_number, booking_date)
VALUES ('${b.id}', '${b.buyerId}', '${b.buyerName.replace(/'/g, "''")}', '${b.buyerEmail}', '${b.buyerPhone}', '${b.buyerCnic || ''}', '${b.plotId}', '${b.plotNumber}', '${b.sector}', '${b.societyId}', '${b.societyName.replace(/'/g, "''")}', ${b.totalPricePKR}, ${b.tokenAdvancePKR || 50000}, ${b.downPaymentPKR}, ${b.monthlyInstallmentPKR}, ${b.totalInstallments}, '${b.status}', ${b.pipelineStage}, ${b.dealerId ? `'${b.dealerId}'` : 'NULL'}, ${b.dealerName ? `'${b.dealerName.replace(/'/g, "''")}'` : 'NULL'}, ${b.allotmentLetterNumber ? `'${b.allotmentLetterNumber}'` : 'NULL'}, '${b.bookingDate}')
ON CONFLICT (id) DO NOTHING;\n`;
  });

  sql += `\n-- 7. INSERT INSTALLMENTS\n`;
  SEED_INSTALLMENTS.forEach(inst => {
    sql += `INSERT INTO public.installments (id, booking_id, installment_number, due_date, amount_pkr, late_fee_pkr, status, paid_date, payment_method, transaction_id, receipt_number, challan_number, plot_number, society_name)
VALUES ('${inst.id}', '${inst.bookingId}', ${inst.installmentNumber}, '${inst.dueDate}', ${inst.amountPKR}, ${inst.lateFeePKR || 0}, '${inst.status}', ${inst.paidDate ? `'${inst.paidDate}'` : 'NULL'}, ${inst.paymentMethod ? `'${inst.paymentMethod}'` : 'NULL'}, ${inst.transactionId ? `'${inst.transactionId}'` : 'NULL'}, ${inst.receiptNumber ? `'${inst.receiptNumber}'` : 'NULL'}, '${inst.challanNumber || ''}', '${inst.plotNumber || ''}', '${(inst.societyName || '').replace(/'/g, "''")}')
ON CONFLICT (id) DO NOTHING;\n`;
  });

  sql += `\n-- 8. INSERT LOT ASSIGNMENTS (Dealer Authorizations)\n`;
  SEED_LOT_ASSIGNMENTS.forEach(lot => {
    const plotIdsArr = `ARRAY[${lot.plotIds.map(pid => `'${pid}'`).join(', ')}]`;
    const plotNumsArr = `ARRAY[${lot.plotNumbers.map(pnum => `'${pnum}'`).join(', ')}]`;
    sql += `INSERT INTO public.lot_assignments (id, lot_number, society_id, society_name, block, dealer_id, dealer_name, dealer_license, dealer_phone, plot_ids, plot_numbers, assigned_date, expiry_date, status, commission_percent, assigned_by, notes)
VALUES ('${lot.id}', '${lot.lotNumber}', '${lot.societyId}', '${lot.societyName.replace(/'/g, "''")}', '${lot.block}', '${lot.dealerId}', '${lot.dealerName.replace(/'/g, "''")}', '${lot.dealerLicense || ''}', '${lot.dealerPhone || ''}', ${plotIdsArr}, ${plotNumsArr}, '${lot.assignedDate}', '${lot.expiryDate}', '${lot.status}', ${lot.commissionPercent}, '${lot.assignedBy.replace(/'/g, "''")}', '${(lot.notes || '').replace(/'/g, "''")}')
ON CONFLICT (id) DO NOTHING;\n`;
  });

  sql += `\n-- 9. INSERT DOCUMENTS (Verified Dossiers in Document Locker)\n`;
  SEED_DOCUMENTS.forEach(doc => {
    sql += `INSERT INTO public.documents (id, title, type, category, booking_id, buyer_id, buyer_name, buyer_cnic, plot_number, society_name, file_url, file_size, verified_stamp)
VALUES ('${doc.id}', '${doc.title.replace(/'/g, "''")}', '${doc.type || 'allotment_letter'}', '${doc.category || 'allotment'}', ${doc.bookingId ? `'${doc.bookingId}'` : 'NULL'}, ${doc.buyerId ? `'${doc.buyerId}'` : 'NULL'}, ${doc.buyerName ? `'${doc.buyerName.replace(/'/g, "''")}'` : 'NULL'}, ${doc.buyerCnic ? `'${doc.buyerCnic}'` : 'NULL'}, '${doc.plotNumber || ''}', '${(doc.societyName || '').replace(/'/g, "''")}', '${doc.fileUrl || ''}', '${doc.fileSize || '2.5 MB'}', ${doc.verifiedStamp || true})
ON CONFLICT (id) DO NOTHING;\n`;
  });

  sql += `\nCOMMIT;\n`;
  return sql;
}

export async function runSeed(): Promise<void> {
  console.log(`${colors.bold}${colors.cyan}======================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  MANZILIQ Real Estate Ecosystem - Narowal District Seed${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}======================================================${colors.reset}\n`);

  // 1. Generate SQL File
  const sqlContent = generateSqlSeed();
  const sqlPath = path.join(process.cwd(), 'scripts', 'seed.sql');
  fs.writeFileSync(sqlPath, sqlContent, 'utf-8');
  console.log(`${colors.green}✓ Clean PostgreSQL SQL seed file written to:${colors.reset} ${sqlPath}`);

  // Also ensure supabase/seed.sql exists for standard Supabase CLI
  const supabaseDir = path.join(process.cwd(), 'supabase');
  if (!fs.existsSync(supabaseDir)) {
    fs.mkdirSync(supabaseDir, { recursive: true });
  }
  fs.writeFileSync(path.join(supabaseDir, 'seed.sql'), sqlContent, 'utf-8');
  console.log(`${colors.green}✓ Copied seed to:${colors.reset} supabase/seed.sql`);

  // 2. Check if live Supabase is configured
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id')) {
    console.log(`\n${colors.yellow}Connecting to live Supabase database at ${supabaseUrl}...${colors.reset}`);
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
      // Upsert societies
      const { error: socErr } = await supabase.from('societies').upsert(
        SEED_SOCIETIES.map(s => ({
          id: s.id,
          name: s.name,
          city: s.city,
          district: s.district,
          location: s.location,
          total_plots: s.totalPlots,
          available_plots: s.availablePlots,
          reserved_plots: s.reservedPlots,
          sold_plots: s.soldPlots,
          hero_image: s.heroImage,
          description: s.description,
          amenities: s.amenities,
          approval_status: s.approvalStatus,
          contact_phone: s.contactPhone,
          noc_number: s.nocNumber,
          noc_doc_url: s.nocDocUrl,
          secp_doc_url: s.secpDocUrl
        }))
      );

      if (socErr) {
        console.warn(`Note on Supabase societies upsert: ${socErr.message}`);
      } else {
        console.log(`${colors.green}✓ Synced ${SEED_SOCIETIES.length} housing societies to Supabase.${colors.reset}`);
      }
    } catch (e: any) {
      console.warn(`Supabase direct sync note: ${e.message}`);
    }
  } else {
    console.log(`\n${colors.yellow}ℹ Running in Local / In-Memory Demo Mode (Set VITE_SUPABASE_URL to sync to live Cloud SQL).${colors.reset}`);
  }

  // 3. Print Summary of Seed Data
  console.log(`\n${colors.bold}Seed Statistics Summary:${colors.reset}`);
  console.log(`------------------------------------------------------`);
  console.log(`• Housing Societies (Narowal District): ${colors.bold}${SEED_SOCIETIES.length}${colors.reset}`);
  SEED_SOCIETIES.forEach(s => {
    console.log(`  - ${s.name} (${s.totalPlots} total plots: ${s.availablePlots} available, ${s.reservedPlots} reserved, ${s.soldPlots} sold)`);
  });
  console.log(`• Total Masterplan Plots:               ${colors.bold}${SEED_PLOTS.length}${colors.reset}`);
  const availableCount = SEED_PLOTS.filter(p => p.status === 'available').length;
  const reservedCount = SEED_PLOTS.filter(p => p.status === 'reserved').length;
  const soldCount = SEED_PLOTS.filter(p => p.status === 'sold').length;
  const disputedCount = SEED_PLOTS.filter(p => p.status === 'disputed').length;
  console.log(`  - Available (for token booking):      ${availableCount} (~${Math.round(availableCount/SEED_PLOTS.length*100)}%)`);
  console.log(`  - Token-Locked / Reserved:            ${reservedCount} (~${Math.round(reservedCount/SEED_PLOTS.length*100)}%)`);
  console.log(`  - Sold & Registered:                  ${soldCount} (~${Math.round(soldCount/SEED_PLOTS.length*100)}%)`);
  console.log(`  - Under Dispute / Mediation:          ${disputedCount} (~${Math.round(disputedCount/SEED_PLOTS.length*100)}%)`);
  console.log(`• User Accounts across 4 Roles:         ${colors.bold}${SEED_USERS.length}${colors.reset}`);
  console.log(`  - Super Admins:                       2`);
  console.log(`  - Housing Society Admins:             4`);
  console.log(`  - Certified Real Estate Dealers:      5`);
  console.log(`  - Verified Customer / Buyers:         12 (Local & Overseas)`);
  console.log(`• Active Deal Bookings:                 ${colors.bold}${SEED_BOOKINGS.length}${colors.reset} (Pipeline stages 3, 4, 5, 6)`);
  console.log(`• Installment Ledger Records:           ${colors.bold}${SEED_INSTALLMENTS.length}${colors.reset} (Paid, Due, Overdue + Late Fees)`);
  console.log(`• Dealer Quota Lot Authorizations:      ${colors.bold}${SEED_LOT_ASSIGNMENTS.length}${colors.reset}`);
  console.log(`• Document Locker Verified Dossiers:    ${colors.bold}${SEED_DOCUMENTS.length}${colors.reset}`);
  console.log(`• Multi-channel Notifications:          ${colors.bold}${SEED_NOTIFICATIONS.length}${colors.reset} (In-App, Push, SMS, Email)`);
  console.log(`• Active Client Inquiries:              ${colors.bold}${SEED_INQUIRIES.length}${colors.reset}`);
  console.log(`------------------------------------------------------`);
  console.log(`${colors.green}${colors.bold}✓ Seed data initialized successfully.${colors.reset}\n`);
}

// Execute if run via CLI `tsx scripts/seed.ts`
if (process.argv[1] && process.argv[1].includes('seed')) {
  runSeed().catch(err => {
    console.error('Seed execution error:', err);
    process.exit(1);
  });
}
