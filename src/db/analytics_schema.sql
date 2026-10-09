-- ==============================================================================
-- MANZILIQ Analytics & Reporting Module - PostgreSQL / Supabase Schema & Indexes
-- Optimized for High-Throughput Aggregations, Reporting Views & Trend Analytics
-- ==============================================================================

-- 1. Optimized B-Tree & Composite Indexes for Fast Time-Series & Filter Queries
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_society_status ON public.bookings(society_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_pipeline_stage ON public.bookings(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_bookings_dealer_id ON public.bookings(dealer_id);

CREATE INDEX IF NOT EXISTS idx_installments_due_date ON public.installments(due_date);
CREATE INDEX IF NOT EXISTS idx_installments_status ON public.installments(status);
CREATE INDEX IF NOT EXISTS idx_installments_society_id ON public.installments(society_id);
CREATE INDEX IF NOT EXISTS idx_installments_paid_date ON public.installments(paid_date);

CREATE INDEX IF NOT EXISTS idx_properties_type_city ON public.properties(type, city);
CREATE INDEX IF NOT EXISTS idx_properties_society_id ON public.properties(society_id);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at);

CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON public.profiles(role, status);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON public.audit_logs(category);

-- 2. Materialized / Standard Analytical Views for Instant Super Admin Lookups

-- View: Monthly Sales Volume by Society
CREATE OR REPLACE VIEW public.view_monthly_sales_analytics AS
SELECT 
  DATE_TRUNC('month', b.created_at) AS sale_month,
  b.society_id,
  s.name AS society_name,
  s.city AS society_city,
  COUNT(b.id) AS total_units_sold,
  SUM(b.total_price_pkr) AS gross_sales_volume_pkr,
  AVG(b.total_price_pkr) AS avg_ticket_size_pkr
FROM public.bookings b
LEFT JOIN public.societies s ON b.society_id = s.id
WHERE b.status IN ('approved', 'completed')
GROUP BY 1, 2, 3, 4
ORDER BY sale_month DESC;

-- View: Installment Collection & Defaulter Aging
CREATE OR REPLACE VIEW public.view_installment_defaulters_summary AS
SELECT 
  s.id AS society_id,
  s.name AS society_name,
  COUNT(i.id) AS total_installments,
  COUNT(CASE WHEN i.status = 'paid' THEN 1 END) AS paid_installments,
  COUNT(CASE WHEN i.status = 'overdue' THEN 1 END) AS overdue_installments,
  COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.amount_pkr ELSE 0 END), 0) AS total_collected_pkr,
  COALESCE(SUM(CASE WHEN i.status = 'overdue' THEN i.amount_pkr ELSE 0 END), 0) AS total_overdue_pkr,
  COALESCE(SUM(CASE WHEN i.status = 'due' THEN i.amount_pkr ELSE 0 END), 0) AS total_pending_due_pkr,
  ROUND(
    (COUNT(CASE WHEN i.status = 'overdue' THEN 1 END)::numeric / NULLIF(COUNT(i.id), 0)) * 100, 
    2
  ) AS defaulter_rate_percent
FROM public.societies s
LEFT JOIN public.installments i ON s.id = i.society_id
GROUP BY s.id, s.name;

-- View: Society Plot Sell-Through Performance
CREATE OR REPLACE VIEW public.view_society_sell_through_performance AS
SELECT 
  s.id AS society_id,
  s.name AS society_name,
  s.city,
  s.total_plots,
  s.sold_plots,
  s.available_plots,
  s.reserved_plots,
  ROUND((s.sold_plots::numeric / NULLIF(s.total_plots, 0)) * 100, 1) AS sell_through_rate_percent,
  COUNT(DISTINCT b.dealer_id) AS active_dealers_count
FROM public.societies s
LEFT JOIN public.bookings b ON s.id = b.society_id
GROUP BY s.id, s.name, s.city, s.total_plots, s.sold_plots, s.available_plots, s.reserved_plots;

-- View: AI Price Estimation vs Actual Historical Recorded Sale Prices
CREATE TABLE IF NOT EXISTS public.ai_market_price_trends (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  society_id TEXT REFERENCES public.societies(id) ON DELETE CASCADE,
  society_name TEXT NOT NULL,
  area_category TEXT NOT NULL,
  period_quarter TEXT NOT NULL, -- e.g. '2025-Q1', '2025-Q2', '2026-Q1'
  avg_predicted_price_per_marla NUMERIC NOT NULL,
  avg_actual_price_per_marla NUMERIC NOT NULL,
  variance_percent NUMERIC NOT NULL,
  trend_direction TEXT NOT NULL CHECK (trend_direction IN ('appreciating', 'stable', 'cooling')),
  sales_sample_size INTEGER DEFAULT 10,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
