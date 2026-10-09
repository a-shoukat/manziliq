# MANZILIQ — Smart Real Estate & Housing Society Management Platform

**MANZILIQ** is a comprehensive, next-generation smart housing society management and real estate ecosystem designed specifically for the Pakistani real estate landscape (with initial focus on Narowal district, Punjab). It unifies property discovery, interactive masterplan mapping, verified plot booking, automated installment scheduling, multi-channel notifications (Google SMTP, SMS, FCM Push, In-App), AI-driven price prediction, biometric/camera plot media capture, digital legal deed generation, and executive governance into one high-performance platform.

---

## 🎓 Final Year Project (FYP) Team Credits

**Department of Computer Science & Engineering**  
**University of Engineering and Technology (UET) Lahore — Narowal Campus**

| Student Name | Roll Number | Role |
| :--- | :--- | :--- |
| **Ayesha Shoukat** | `2023-CS-512` | Lead Super Admin, System Architecture & Full-Stack Engineering |
| **Eman Khan** | `2023-CS-550` | AI/ML Price Estimation Models, Analytics & Backend Services |
| **Mehak Eman** | `2023-CS-541` | Frontend UX, Marketplace, Interactive GIS Maps & Document Engine |

*Supervised by Faculty of Computer Science & Engineering, UET Lahore.*

---

## 🛠️ Tech Stack

| Layer | Technologies & Libraries |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript 5.8, Vite 6 |
| **Styling & Animation** | Tailwind CSS v4, Lucide React icons, Motion (Framer Motion) |
| **Visualizations & Maps** | Recharts, D3.js, `@react-google-maps/api`, SVG Masterplan overlays |
| **Backend & Runtime** | Node.js (v20+ / v22+), Express 4.21, `tsx` TypeScript runtime, esbuild |
| **Database & ORM** | PostgreSQL / Supabase, Drizzle ORM, Drizzle Kit, pg client |
| **Notifications & Comms** | Nodemailer (Google SMTP / Gmail TLS/SSL), SMS Gateway abstraction, Firebase Cloud Messaging (FCM) |
| **Document Generation** | jsPDF (Legal transfer deeds, allotment certificates, payment receipts), QRCode generation |
| **AI & Voice Services** | Google GenAI SDK (`@google/genai` Gemini 2.5), Whisper-compatible STT, Python ML microservice |
| **Python ML Microservice** | Python 3.10+, Flask, scikit-learn, XGBoost, pandas, NumPy, joblib |

---

## 🗺️ Mapping of Proposal Modules to Source Code

The 12 core project modules specified in the FYP proposal are implemented across the following frontend views, backend routes, and database layers:

| # | Proposal Module | Primary Source Files & Directories | Core Responsibilities |
| :-: | :--- | :--- | :--- |
| **1** | **Authentication & RBAC** | `src/views/auth/`<br>`src/services/authService.ts`<br>`src/middleware/auth.ts`<br>`server/routes.ts` | Role-Based Access Control (Super Admin, Society Admin, Dealer, Buyer, Public Explorer), demo 1-click logins, JWT/session verification. |
| **2** | **Property Marketplace** | `src/views/PropertyMarketplace.tsx`<br>`src/views/properties/`<br>`src/views/HeroSection.tsx`<br>`src/components/MediaPermissionButton.tsx` | Search, filtering (type, budget, marla, society), voice search with microphone STT, camera photo capture for new listings. |
| **3** | **Housing Society Management** | `src/views/SocietyDashboard.tsx`<br>`src/views/society/`<br>`src/db/schema.ts` | Society profile, block/phase management, inventory tracking, plot status transitions (Available, Reserved, Booked, Sold). |
| **4** | **Dealer CRM & Leads** | `src/views/DealerDashboard.tsx`<br>`src/views/dealer/`<br>`src/services/dealerService.ts` | Dealer verified portal, lead pipeline stages, commission logs, site visit scheduler, CRM due task alerts. |
| **5** | **Interactive Maps & Masterplans**| `src/views/InteractiveMasterplanMap.tsx`<br>`src/components/InteractiveMap.tsx`<br>`src/components/PlotSvgMap.tsx` | Google Maps overlay, GIS coordinate markers, SVG interactive masterplans with click-to-inspect plot details. |
| **6** | **Plot Booking Engine** | `src/views/buyer/BuyerBookingsTab.tsx`<br>`src/views/society/SocietyBookingsTab.tsx`<br>`src/services/bookingService.ts` | Instant plot reservation, CNIC verification, token payment submission, booking approvals, allotment letters. |
| **7** | **Installments & Ledger Tracking**| `src/views/buyer/BuyerInstallmentsTab.tsx`<br>`src/views/society/SocietyFinancesTab.tsx`<br>`src/services/paymentService.ts` | Dynamic installment schedules, payment status, penalty calculations, computerized financial receipts. |
| **8** | **AI Property Price Prediction**| `src/views/AiPriceEstimatorView.tsx`<br>`server/priceEstimator.ts`<br>`ml_service/` (`train_models.py`, `app.py`) | Dual-mode valuation: Node.js regression fallback + external Python ML service (Random Forest, Gradient Boosting, Ridge). |
| **9** | **Multi-Channel Notifications** | `src/views/common/NotificationCenterView.tsx`<br>`server/notificationOrchestrator.ts`<br>`server/emailService.ts`<br>`server/smsService.ts`<br>`server/fcmService.ts` | Unified notification dispatcher: In-App, Google SMTP Gmail dispatch, SMS gateway preview, FCM push, automated reminder scheduler. |
| **10**| **System Administration** | `src/views/AdminDashboard.tsx`<br>`src/views/admin/`<br>`server/routes.ts` | Society verification, dealer licensing compliance, platform audit logs, user governance, database seeding. |
| **11**| **Legal Docs & Digital Agreements**| `src/views/buyer/BuyerDocumentsTab.tsx`<br>`server/legalDocuments.ts`<br>`src/utils/` | Stamp-paper styled PDF generation: Allotment Certificate, Legal Transfer Deed, Booking Agreement with QR verification. |
| **12**| **Executive Analytics & Reporting** | `src/views/admin/AdminAnalyticsTab.tsx`<br>`server/analyticsRouter.ts`<br>`src/components/` | Society revenue charts, block sales velocity, dealer leaderboard, property price trends, payment collection rates. |

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js** v20.x or v22.x
- **npm** v10.x or higher
- Optional: **Python 3.10+** (if running the standalone ML microservice)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```
Fill in your credentials (such as Google SMTP, Supabase, or Gemini API key).

### Step 3: Run the Development Server
```bash
npm run dev
```
The server starts at `http://localhost:3000` (serving Express API and Vite React frontend with HMR).

### Step 4: Run Type-Checking & Linting
```bash
npm run lint
```

### Step 5: Production Build & Bundle
```bash
npm run build
```
This runs `vite build` (optimized with code-splitting chunks for charts, maps, and utils) and bundles `server.ts` into `dist/server.cjs`.

### Step 6: Start Production Server
```bash
npm start
```

---

## 🧠 Optional Python ML Microservice (`ml_service/`)

The application includes an optional Python machine learning microservice for advanced property price estimation trained on Pakistan/Narowal real estate data.

```bash
# Navigate to the ML service directory
cd ml_service

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Train models (Random Forest, Gradient Boosting, Linear Regression)
python train_models.py

# Launch Flask API server (runs on http://localhost:5001)
python app.py
```

*Note: If the Python service is offline, the Node.js backend automatically falls back to an embedded parametric model calibrated to Narowal society benchmarks with zero downtime.*

---

## 👥 Demo Accounts (1-Click Login)

The platform provides pre-configured role-based test accounts accessible via the **1-Click Demo Login** buttons on the login screen:

| Role | Name | Email | Password | Key Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Public Explorer** | Guest Explorer | `guest.explorer@manziliq.pk` | *(None / Guest)* | Marketplace search, masterplan browsing, price estimation |
| **Verified Buyer** | Muhammad Farooq | `farooq.buyer@gmail.com` | `Password123@#` | Plot booking, installment tracking, document downloads |
| **Licensed Dealer** | Chaudhry Tariq | `tariq.realtor@manziliq.pk` | `Password123@#` | Lead CRM, task alerts, client visit scheduling, commissions |
| **Society Admin** | Al-Rehman Garden Admin | `admin@alrehmangarden.pk` | `Password123@#` | Inventory management, booking approvals, payment reconciliations |
| **Super Admin** | Ayesha Shoukat | `ayeshashoukat2023cs512@gmail.com` | `Aye_sha123@#` | Platform governance, society approvals, dealer licenses, analytics |

---

## 🔌 Key API Endpoints

### Core & Health
- `GET /api/health` — Service health status and timestamp
- `POST /api/seed` — Seed or reinitialize demo database
- `GET /api/seed/summary` — Overview of societies, plots, bookings, and ledger entries

### AI Price Prediction (Module 8)
- `POST /api/price-estimate/` — Predict property valuation given `property_type`, `size_marla`, `society_name`, `block_phase`, etc.
- `GET /api/price-estimate/models-performance` — Comparison metrics (MAE, RMSE, R² scores) across trained algorithms
- `GET /api/price-estimate/societies` — List of supported societies with benchmark rates

### Legal Documents & Digital Deeds (Module 11)
- `POST /api/documents/generate-allotment` — Generate official Allotment Certificate PDF
- `POST /api/documents/generate-transfer-deed` — Generate digital Legal Transfer Deed with buyer/seller/society stamps
- `POST /api/documents/generate-receipt` — Generate verified installment payment receipt

### Centralized Notifications & Google SMTP (Module 9)
- `GET /api/notifications?userId=:id` — Fetch notifications inbox
- `POST /api/notifications/dispatch` — Dispatch notification across designated channels (SMS, Email, Push, In-App)
- `GET /api/notifications/smtp/status` — Inspect Google SMTP / Gmail configuration and readiness
- `POST /api/notifications/smtp/verify` — Live SMTP handshake verification
- `POST /api/notifications/smtp/test-send` — Send live HTML test email via Google SMTP

### Executive Analytics (Module 12)
- `GET /api/analytics/overview` — High-level platform KPIs (revenue, active plots, recovery rate)
- `GET /api/analytics/societies` — Society-wise performance metrics
- `GET /api/analytics/dealers` — Dealer sales leaderboard

---

## 🔐 Environment Variables

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | HTTP port for the Express + Vite server | `3000` |
| `NODE_ENV` | Application environment mode | `development` / `production` |
| `VITE_SUPABASE_URL` | Supabase project API URL | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous public key | `eyJhbGciOi...` |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port (465 for SSL, 587 for TLS) | `465` |
| `SMTP_SECURE` | Use SSL encryption | `true` |
| `SMTP_USER` | Gmail address for dispatching | `your-email@gmail.com` |
| `SMTP_PASS` | 16-character Google App Password | `abcd efgh ijkl mnop` |
| `EMAIL_FROM` | Sender email address | `your-email@gmail.com` |
| `EMAIL_FROM_NAME` | Friendly sender name | `"MANZILIQ Smart Housing"` |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key | `AIzaSy...` |
| `GEMINI_API_KEY` | Google Gemini API key for AI assistant | `AIzaSy...` |
| `PYTHON_ML_SERVICE_URL` | Optional URL for Python ML Flask backend | `http://localhost:5001` |

---

## 🗄️ Supabase / PostgreSQL Setup

1. Create a new project in [Supabase](https://supabase.com).
2. Retrieve your **Project URL** and **anon public key** from `Project Settings -> API`.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your `.env` file.
4. Execute SQL migrations in `supabase/schema.sql` (or run `npm run seed`) to create the relational tables for societies, plots, users, bookings, installment plans, and audit logs.

---

## 🚀 Deployment Guide

### Deployment on Railway / Render (Full-Stack Express + Node)
1. Link your GitHub repository to Railway or Render.
2. Ensure Build Command is set to:
   ```bash
   npm install && npm run build
   ```
3. Set Start Command to:
   ```bash
   npm start
   ```
4. Add environment variables (`SMTP_USER`, `SMTP_PASS`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, etc.) in the dashboard settings.

### Deployment on Vercel (Frontend SPA)
1. Import repository into Vercel.
2. Select **Vite** preset.
3. Configure Output Directory as `dist`.
4. Define environment variables in Vercel project settings.

---

## 📋 Pre-Launch Verification Checklist

- [x] TypeScript validation clean (`npx tsc --noEmit` returns zero errors).
- [x] Vite production bundle passes with no duplicate switch warnings.
- [x] Chunk-splitting enabled (`vendor-charts`, `vendor-maps`, `vendor-utils`).
- [x] Backend bundle builds cleanly via esbuild (`dist/server.cjs`).
- [x] API Health endpoint returns status `ok`.
- [x] AI price prediction calculates market estimates with confidence scores.
- [x] Legal document generator produces PDF transfer deeds and allotment certificates.
- [x] Google SMTP live verification and transactional emails tested.
- [x] Audio voice search and camera photo capture integrated into property workflows.

---

## ⚠️ Known Limitations & Assumptions

1. **Simulated Payment Gateway**: Real Pakistani payment gateways (1Link, Easypaisa, JazzCash) require local merchant licensing; booking tokens and installment settlements are currently processed via simulated sandbox confirmations with instant ledger reconciliation.
2. **Demo Authentication**: Demo accounts use local state persistence and pre-hashed credentials for presentation and assessment convenience.
3. **Local Media Uploads**: Voice search recordings and camera photos are processed in-memory or stored in `/public/uploads` rather than a persistent external cloud bucket (e.g. AWS S3).
4. **Narowal Dataset Focus**: Machine learning price models and society masterplans are initially calibrated on real-world benchmarks from Narowal housing societies (Al-Rehman Garden, Citi Housing Narowal, Model Town Narowal). Additional cities can be incorporated by retraining with `train_models.py`.

---

**MANZILIQ** — Developed by Department of Computer Science & Engineering, UET Lahore (Narowal Campus).
