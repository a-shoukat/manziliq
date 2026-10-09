import { Router, Request, Response } from 'express';

export const analyticsRouter = Router();

// ==============================================================================
// SEED ANALYTICAL DATA & TIME SERIES ENGINE
// Comprehensive mock & real DB aggregation fallback data for Punjab Real Estate
// ==============================================================================

interface FilterParams {
  range?: '30d' | '90d' | 'quarter' | 'year' | 'all' | string;
  societyId?: string;
  startDate?: string;
  endDate?: string;
}

// 1. Sales Volume Time-Series Data (Monthly & Quarterly)
const TIME_SERIES_SALES = [
  { period: 'Sep 2025', quarter: '2025-Q3', volumePKR: 28500000, unitsSold: 9, avgPricePKR: 3166666, tokenAdvancePKR: 2850000 },
  { period: 'Oct 2025', quarter: '2025-Q4', volumePKR: 34200000, unitsSold: 11, avgPricePKR: 3109090, tokenAdvancePKR: 3420000 },
  { period: 'Nov 2025', quarter: '2025-Q4', volumePKR: 39800000, unitsSold: 13, avgPricePKR: 3061538, tokenAdvancePKR: 3980000 },
  { period: 'Dec 2025', quarter: '2025-Q4', volumePKR: 44600000, unitsSold: 14, avgPricePKR: 3185714, tokenAdvancePKR: 4460000 },
  { period: 'Jan 2026', quarter: '2026-Q1', volumePKR: 42100000, unitsSold: 13, avgPricePKR: 3238461, tokenAdvancePKR: 4210000 },
  { period: 'Feb 2026', quarter: '2026-Q1', volumePKR: 48900000, unitsSold: 15, avgPricePKR: 3260000, tokenAdvancePKR: 4890000 },
  { period: 'Mar 2026', quarter: '2026-Q1', volumePKR: 53400000, unitsSold: 17, avgPricePKR: 3141176, tokenAdvancePKR: 5340000 },
  { period: 'Apr 2026', quarter: '2026-Q2', volumePKR: 58200000, unitsSold: 18, avgPricePKR: 3233333, tokenAdvancePKR: 5820000 },
  { period: 'May 2026', quarter: '2026-Q2', volumePKR: 61500000, unitsSold: 19, avgPricePKR: 3236842, tokenAdvancePKR: 6150000 },
  { period: 'Jun 2026', quarter: '2026-Q2', volumePKR: 67800000, unitsSold: 21, avgPricePKR: 3228571, tokenAdvancePKR: 6780000 },
  { period: 'Jul 2026', quarter: '2026-Q3', volumePKR: 72400000, unitsSold: 22, avgPricePKR: 3290909, tokenAdvancePKR: 7240000 },
  { period: 'Aug 2026', quarter: '2026-Q3', volumePKR: 81200000, unitsSold: 25, avgPricePKR: 3248000, tokenAdvancePKR: 8120000 }
];

// 2. Sales by Society
const SALES_BY_SOCIETY = [
  { societyId: 'soc-001', societyName: 'Al-Rehman Garden Phase 7', city: 'Lahore / Narowal', unitsSold: 64, volumePKR: 214500000, sharePercent: 33.9, avgTicketPKR: 3351562 },
  { societyId: 'soc-002', societyName: 'Royal Orchard Multan', city: 'Multan', unitsSold: 42, volumePKR: 158000000, sharePercent: 24.9, avgTicketPKR: 3761904 },
  { societyId: 'soc-003', societyName: 'Model City Housing', city: 'Narowal', unitsSold: 38, volumePKR: 119800000, sharePercent: 18.9, avgTicketPKR: 3152631 },
  { societyId: 'soc-004', societyName: 'Executive City Zafarwal', city: 'Zafarwal', unitsSold: 27, volumePKR: 78400000, sharePercent: 12.4, avgTicketPKR: 2903703 },
  { societyId: 'soc-005', societyName: 'Green Valley Housing', city: 'Shakargarh', unitsSold: 21, volumePKR: 62000000, sharePercent: 9.9, avgTicketPKR: 2952380 }
];

// 3. Sales by Property Type
const SALES_BY_PROPERTY_TYPE = [
  { type: 'Residential 5 Marla Plot', category: 'residential', unitsSold: 98, volumePKR: 254800000, sharePercent: 40.3, fill: '#3b82f6' },
  { type: 'Residential 10 Marla Plot', category: 'residential', unitsSold: 45, volumePKR: 189000000, sharePercent: 29.9, fill: '#10b981' },
  { type: 'Commercial 4 Marla Plot', category: 'commercial', unitsSold: 24, volumePKR: 124800000, sharePercent: 19.7, fill: '#8b5cf6' },
  { type: 'Luxury Villa / House', category: 'residential', unitsSold: 16, volumePKR: 52400000, sharePercent: 8.3, fill: '#f59e0b' },
  { type: 'Commercial Plaza Unit', category: 'commercial', unitsSold: 9, volumePKR: 11700000, sharePercent: 1.8, fill: '#ef4444' }
];

// 4. Sales by City / District Region
const SALES_BY_REGION = [
  { region: 'Lahore & Metro Ring', unitsSold: 74, volumePKR: 256000000, sharePercent: 40.5 },
  { region: 'Narowal District Central', unitsSold: 62, volumePKR: 194500000, sharePercent: 30.7 },
  { region: 'Multan & South Punjab', unitsSold: 42, volumePKR: 158000000, sharePercent: 25.0 },
  { region: 'Zafarwal / Shakargarh Belt', unitsSold: 14, volumePKR: 24200000, sharePercent: 3.8 }
];

// 5. Revenue & Installment Performance
const REVENUE_INSTALLMENT_SUMMARY = {
  totalGrossBookingsPKR: 632700000,
  totalRevenueCollectedPKR: 448200000,
  totalPendingReceivablesPKR: 184500000,
  collectionRatePercent: 70.8,
  totalOverdueAmountPKR: 28400000,
  overallDefaulterRatePercent: 4.8,
  avgCollectionDays: 18.4,
  overdueAgingBreakdown: [
    { bucket: '1 - 30 Days Overdue', amountPKR: 14200000, count: 28, riskLevel: 'low' },
    { bucket: '31 - 60 Days Overdue', amountPKR: 8600000, count: 14, riskLevel: 'medium' },
    { bucket: '61 - 90 Days Overdue', amountPKR: 3800000, count: 6, riskLevel: 'high' },
    { bucket: '90+ Days Overdue (Notice Stage)', amountPKR: 1800000, count: 3, riskLevel: 'critical' }
  ],
  societyOverdueList: [
    { societyName: 'Al-Rehman Garden Phase 7', totalDuePKR: 54000000, collectedPKR: 44200000, overduePKR: 9800000, defaulterRate: 4.2 },
    { societyName: 'Royal Orchard Multan', totalDuePKR: 42000000, collectedPKR: 34500000, overduePKR: 7500000, defaulterRate: 5.1 },
    { societyName: 'Model City Housing', totalDuePKR: 31000000, collectedPKR: 25800000, overduePKR: 5200000, defaulterRate: 4.9 },
    { societyName: 'Executive City Zafarwal', totalDuePKR: 19500000, collectedPKR: 16100000, overduePKR: 3400000, defaulterRate: 5.8 },
    { societyName: 'Green Valley Housing', totalDuePKR: 14000000, collectedPKR: 11500000, overduePKR: 2500000, defaulterRate: 6.2 }
  ],
  defaulterTrendHistory: [
    { month: 'Mar 2026', defaulterRate: 6.4, overdueAmountPKR: 34200000 },
    { month: 'Apr 2026', defaulterRate: 5.9, overdueAmountPKR: 32100000 },
    { month: 'May 2026', defaulterRate: 5.4, overdueAmountPKR: 30800000 },
    { month: 'Jun 2026', defaulterRate: 5.1, overdueAmountPKR: 29500000 },
    { month: 'Jul 2026', defaulterRate: 4.9, overdueAmountPKR: 28900000 },
    { month: 'Aug 2026', defaulterRate: 4.8, overdueAmountPKR: 28400000 }
  ]
};

// 6. User Activity & Engagement Tracking
const USER_ACTIVITY_DATA = {
  totalUsers: 1420,
  buyersCount: 1180,
  activeDealersCount: 48,
  inactiveDealersCount: 7,
  societyAdminsCount: 12,
  userGrowthTimeSeries: [
    { month: 'Mar 2026', newBuyers: 94, newDealers: 4, activeSessions: 1840 },
    { month: 'Apr 2026', newBuyers: 118, newDealers: 6, activeSessions: 2310 },
    { month: 'May 2026', newBuyers: 135, newDealers: 5, activeSessions: 2890 },
    { month: 'Jun 2026', newBuyers: 152, newDealers: 7, activeSessions: 3420 },
    { month: 'Jul 2026', newBuyers: 174, newDealers: 8, activeSessions: 4120 },
    { month: 'Aug 2026', newBuyers: 210, newDealers: 9, activeSessions: 4980 }
  ],
  buyerEngagementMetrics: {
    inquiriesSubmitted: 842,
    siteVisitsScheduled: 296,
    siteVisitsCompleted: 248,
    bookingConversionRate: '22.8%',
    avgResponseTimeMinutes: 24.5
  },
  mostViewedSocieties: [
    { name: 'Al-Rehman Garden Phase 7', views: 18420, inquiries: 340, siteVisits: 118 },
    { name: 'Royal Orchard Multan', views: 14200, inquiries: 260, siteVisits: 84 },
    { name: 'Model City Housing', views: 10850, inquiries: 180, siteVisits: 62 },
    { name: 'Executive City Zafarwal', views: 6420, inquiries: 98, siteVisits: 32 }
  ],
  mostViewedProperties: [
    { title: 'Executive 5-Marla Park Facing Corner Plot', society: 'Al-Rehman Garden', views: 4210, inquiries: 112, pricePKR: 2600000 },
    { title: 'Commercial Plaza 4-Marla Main Boulevard', society: 'Royal Orchard', views: 3840, inquiries: 94, pricePKR: 5200000 },
    { title: '10-Marla Prime Boulevard Residential Plot', society: 'Model City', views: 3120, inquiries: 76, pricePKR: 4200000 },
    { title: '5-Marla Standard Residential Plot', society: 'Al-Rehman Garden', views: 2890, inquiries: 68, pricePKR: 2450000 }
  ]
};

// 7. Society Detailed Performance Breakdown
const SOCIETY_PERFORMANCE_METRICS = [
  {
    societyId: 'soc-001',
    societyName: 'Al-Rehman Garden Phase 7',
    city: 'Lahore / Narowal',
    totalPlots: 450,
    soldPlots: 315,
    availablePlots: 110,
    reservedPlots: 25,
    sellThroughRatePercent: 70.0,
    avgTimeToSaleDays: 28.4,
    totalSalesVolumePKR: 214500000,
    topDealers: [
      { name: 'Haji Aslam Real Estate', salesCount: 28, volumePKR: 94200000 },
      { name: 'Chaudhry & Sons Associates', salesCount: 21, volumePKR: 68500000 },
      { name: 'Rehman Estate Network', salesCount: 15, volumePKR: 51800000 }
    ]
  },
  {
    societyId: 'soc-002',
    societyName: 'Royal Orchard Multan',
    city: 'Multan',
    totalPlots: 380,
    soldPlots: 242,
    availablePlots: 118,
    reservedPlots: 20,
    sellThroughRatePercent: 63.7,
    avgTimeToSaleDays: 34.2,
    totalSalesVolumePKR: 158000000,
    topDealers: [
      { name: 'Southern Lands & Developers', salesCount: 19, volumePKR: 71400000 },
      { name: 'Multan City Estates', salesCount: 14, volumePKR: 52800000 },
      { name: 'Al-Madina Properties', salesCount: 9, volumePKR: 33800000 }
    ]
  },
  {
    societyId: 'soc-003',
    societyName: 'Model City Housing',
    city: 'Narowal',
    totalPlots: 260,
    soldPlots: 174,
    availablePlots: 72,
    reservedPlots: 14,
    sellThroughRatePercent: 66.9,
    avgTimeToSaleDays: 31.0,
    totalSalesVolumePKR: 119800000,
    topDealers: [
      { name: 'Narowal Property Advisors', salesCount: 18, volumePKR: 56700000 },
      { name: 'Tariq Real Estate', salesCount: 12, volumePKR: 38200000 },
      { name: 'Subhan Estate Zone', salesCount: 8, volumePKR: 24900000 }
    ]
  },
  {
    societyId: 'soc-004',
    societyName: 'Executive City Zafarwal',
    city: 'Zafarwal',
    totalPlots: 180,
    soldPlots: 98,
    availablePlots: 72,
    reservedPlots: 10,
    sellThroughRatePercent: 54.4,
    avgTimeToSaleDays: 42.5,
    totalSalesVolumePKR: 78400000,
    topDealers: [
      { name: 'Zafarwal Premier Realtors', salesCount: 14, volumePKR: 40600000 },
      { name: 'Border Belt Consultants', salesCount: 13, volumePKR: 37800000 }
    ]
  },
  {
    societyId: 'soc-005',
    societyName: 'Green Valley Housing',
    city: 'Shakargarh',
    totalPlots: 150,
    soldPlots: 82,
    availablePlots: 58,
    reservedPlots: 10,
    sellThroughRatePercent: 54.7,
    avgTimeToSaleDays: 44.8,
    totalSalesVolumePKR: 62000000,
    topDealers: [
      { name: 'Shakargarh Valley Estates', salesCount: 12, volumePKR: 35400000 },
      { name: 'Farooq Land Linkers', salesCount: 9, volumePKR: 26600000 }
    ]
  }
];

// 8. AI-Based Market Trend Analysis (Predicted vs Actual Sales Price History)
const AI_MARKET_TRENDS = [
  {
    period: '2025-Q1',
    label: 'Q1 2025',
    avgPredictedPricePerMarla: 440000,
    avgActualSalePricePerMarla: 432000,
    variancePercent: -1.8,
    trendDirection: 'stable',
    marketIndex: 100,
    societiesCount: 4
  },
  {
    period: '2025-Q2',
    label: 'Q2 2025',
    avgPredictedPricePerMarla: 462000,
    avgActualSalePricePerMarla: 458000,
    variancePercent: -0.9,
    trendDirection: 'appreciating',
    marketIndex: 106,
    societiesCount: 4
  },
  {
    period: '2025-Q3',
    label: 'Q3 2025',
    avgPredictedPricePerMarla: 485000,
    avgActualSalePricePerMarla: 492000,
    variancePercent: +1.4,
    trendDirection: 'appreciating',
    marketIndex: 114,
    societiesCount: 5
  },
  {
    period: '2025-Q4',
    label: 'Q4 2025',
    avgPredictedPricePerMarla: 508000,
    avgActualSalePricePerMarla: 518000,
    variancePercent: +2.0,
    trendDirection: 'appreciating',
    marketIndex: 120,
    societiesCount: 5
  },
  {
    period: '2026-Q1',
    label: 'Q1 2026',
    avgPredictedPricePerMarla: 524000,
    avgActualSalePricePerMarla: 532000,
    variancePercent: +1.5,
    trendDirection: 'appreciating',
    marketIndex: 123,
    societiesCount: 5
  },
  {
    period: '2026-Q2',
    label: 'Q2 2026',
    avgPredictedPricePerMarla: 546000,
    avgActualSalePricePerMarla: 554000,
    variancePercent: +1.5,
    trendDirection: 'appreciating',
    marketIndex: 128,
    societiesCount: 5
  },
  {
    period: '2026-Q3',
    label: 'Q3 2026 (Current)',
    avgPredictedPricePerMarla: 570000,
    avgActualSalePricePerMarla: 582000,
    variancePercent: +2.1,
    trendDirection: 'appreciating',
    marketIndex: 135,
    societiesCount: 5
  }
];

// Area-Specific Market Dynamics
const AREA_MARKET_DYNAMICS = [
  { area: 'Al-Rehman Garden (Executive Block)', city: 'Lahore / Narowal', currentRatePerMarla: 580000, yoyGrowthPercent: 18.4, aiForecast12m: 660000, sentiment: 'Bullish / High Demand' },
  { area: 'Royal Orchard (Phase 1)', city: 'Multan', currentRatePerMarla: 620000, yoyGrowthPercent: 14.8, aiForecast12m: 695000, sentiment: 'Bullish / Rapid Infrastructure' },
  { area: 'Model City (Block A)', city: 'Narowal', currentRatePerMarla: 540000, yoyGrowthPercent: 12.5, aiForecast12m: 595000, sentiment: 'Stable Upward' },
  { area: 'Executive City (Main Boulevard)', city: 'Zafarwal', currentRatePerMarla: 460000, yoyGrowthPercent: 10.2, aiForecast12m: 505000, sentiment: 'Emerging Growth' },
  { area: 'Green Valley (Sectors 1 & 2)', city: 'Shakargarh', currentRatePerMarla: 420000, yoyGrowthPercent: 9.1, aiForecast12m: 455000, sentiment: 'Moderate Growth' }
];

// ==============================================================================
// API ROUTE HANDLERS
// ==============================================================================

/**
 * GET /api/analytics/overview
 * Top-level KPI stats banner for Executive Super Admin Dashboard
 */
analyticsRouter.get('/overview', (req: Request, res: Response) => {
  const range = (req.query.range as string) || 'all';

  res.json({
    success: true,
    filterApplied: { range },
    kpis: {
      grossSalesVolumePKR: 632700000,
      totalUnitsSold: 192,
      totalRevenueCollectedPKR: 448200000,
      pendingReceivablesPKR: 184500000,
      defaulterRatePercent: 4.8,
      avgSellThroughRatePercent: 62.0,
      activeUsersCount: 1420,
      activeDealersCount: 48,
      marketAppreciationYoY: '+16.2%'
    },
    quickTrends: {
      salesVolumeChangePercent: '+12.4%',
      collectionRateChangePercent: '+3.2%',
      newBuyersThisMonth: 210,
      aiModelAccuracyVariance: '±1.8%'
    }
  });
});

/**
 * GET /api/analytics/sales
 * Full sales volume charts & cross-segment breakdowns
 */
analyticsRouter.get('/sales', (req: Request, res: Response) => {
  const range = (req.query.range as string) || 'all';
  let filteredTimeSeries = [...TIME_SERIES_SALES];

  if (range === '30d') {
    filteredTimeSeries = TIME_SERIES_SALES.slice(-2);
  } else if (range === '90d' || range === 'quarter') {
    filteredTimeSeries = TIME_SERIES_SALES.slice(-4);
  } else if (range === 'year') {
    filteredTimeSeries = TIME_SERIES_SALES.slice(-12);
  }

  res.json({
    success: true,
    timeSeries: filteredTimeSeries,
    bySociety: SALES_BY_SOCIETY,
    byPropertyType: SALES_BY_PROPERTY_TYPE,
    byRegion: SALES_BY_REGION,
    summary: {
      totalVolumePKR: filteredTimeSeries.reduce((acc, curr) => acc + curr.volumePKR, 0),
      totalUnits: filteredTimeSeries.reduce((acc, curr) => acc + curr.unitsSold, 0),
      avgTicketSizePKR: Math.round(
        filteredTimeSeries.reduce((acc, curr) => acc + curr.volumePKR, 0) /
        filteredTimeSeries.reduce((acc, curr) => acc + curr.unitsSold, 0)
      )
    }
  });
});

/**
 * GET /api/analytics/revenue
 * Comprehensive revenue reconciliation, overdue installment tracking & defaulter rates
 */
analyticsRouter.get('/revenue', (req: Request, res: Response) => {
  res.json({
    success: true,
    revenueReport: REVENUE_INSTALLMENT_SUMMARY
  });
});

/**
 * GET /api/analytics/users
 * User registration velocity, active vs inactive dealers, and buyer engagement funnel
 */
analyticsRouter.get('/users', (req: Request, res: Response) => {
  res.json({
    success: true,
    userActivity: USER_ACTIVITY_DATA
  });
});

/**
 * GET /api/analytics/societies
 * Per-society inventory sell-through, days-to-sale velocity, and top dealer rankings
 */
analyticsRouter.get('/societies', (req: Request, res: Response) => {
  res.json({
    success: true,
    societiesPerformance: SOCIETY_PERFORMANCE_METRICS
  });
});

/**
 * GET /api/analytics/market-trends
 * AI Price Estimator historical prediction vs actual closed price analysis & market appreciation
 */
analyticsRouter.get('/market-trends', (req: Request, res: Response) => {
  res.json({
    success: true,
    trends: AI_MARKET_TRENDS,
    areaDynamics: AREA_MARKET_DYNAMICS,
    aiModelMetrics: {
      modelName: 'ManzilIQ Punjab Land Valuation Engine v2.4',
      historicalAccuracyPercent: 98.2,
      averageVariancePKR: 7800,
      totalValuationsProcessed: 3840
    }
  });
});

/**
 * GET /api/analytics/export/:reportType
 * CSV Data Export endpoint for offline spreadsheet review
 */
analyticsRouter.get('/export/:reportType', (req: Request, res: Response) => {
  const { reportType } = req.params;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=ManzilIQ_${reportType}_Report_${Date.now()}.csv`);

  let csvContent = '';

  if (reportType === 'sales') {
    csvContent = 'Month,Quarter,Units Sold,Gross Volume (PKR),Average Ticket (PKR),Token Advances (PKR)\n';
    TIME_SERIES_SALES.forEach(row => {
      csvContent += `"${row.period}","${row.quarter}",${row.unitsSold},${row.volumePKR},${row.avgPricePKR},${row.tokenAdvancePKR}\n`;
    });
  } else if (reportType === 'societies') {
    csvContent = 'Society Name,City,Total Plots,Sold Plots,Available Plots,Sell-Through %,Sales Volume (PKR),Avg Days to Sale\n';
    SOCIETY_PERFORMANCE_METRICS.forEach(s => {
      csvContent += `"${s.societyName}","${s.city}",${s.totalPlots},${s.soldPlots},${s.availablePlots},${s.sellThroughRatePercent}%,${s.totalSalesVolumePKR},${s.avgTimeToSaleDays}\n`;
    });
  } else if (reportType === 'revenue') {
    csvContent = 'Society Name,Total Due (PKR),Collected (PKR),Overdue (PKR),Defaulter Rate %\n';
    REVENUE_INSTALLMENT_SUMMARY.societyOverdueList.forEach(s => {
      csvContent += `"${s.societyName}",${s.totalDuePKR},${s.collectedPKR},${s.overduePKR},${s.defaulterRate}%\n`;
    });
  } else if (reportType === 'market-trends') {
    csvContent = 'Period,Predicted Rate/Marla (PKR),Actual Sale Rate/Marla (PKR),Variance %,Market Index,Trend Direction\n';
    AI_MARKET_TRENDS.forEach(t => {
      csvContent += `"${t.label}",${t.avgPredictedPricePerMarla},${t.avgActualSalePricePerMarla},${t.variancePercent}%,${t.marketIndex},"${t.trendDirection}"\n`;
    });
  } else {
    // General Master Summary
    csvContent = 'Metric,Value\n';
    csvContent += `"Gross Platform Sales GMV","PKR 632,700,000"\n`;
    csvContent += `"Total Units Sold","192 Units"\n`;
    csvContent += `"Revenue Collected","PKR 448,200,000"\n`;
    csvContent += `"Pending Receivables","PKR 184,500,000"\n`;
    csvContent += `"Defaulter Rate","4.8%"\n`;
    csvContent += `"Total Registered Users","1,420"\n`;
    csvContent += `"Active Registered Dealers","48"\n`;
  }

  res.send(csvContent);
});
