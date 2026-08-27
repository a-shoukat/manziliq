import React, { useState } from 'react';
import { Plot, Booking, Society, User } from '../types';
import { SocietyBookingTrendsWidget } from '../components/society/SocietyBookingTrendsWidget';
import { 
  Building2, 
  Plus, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  TrendingUp, 
  Download, 
  Users, 
  Edit3, 
  Trash2, 
  X,
  Sparkles
} from 'lucide-react';

interface SocietyDashboardProps {
  society: Society;
  plots: Plot[];
  bookings: Booking[];
  onAddPlot: (newPlot: Omit<Plot, 'id'>) => void;
  onUpdatePlotStatus: (plotId: string, status: Plot['status']) => void;
  onApproveBooking: (bookingId: string) => void;
  onRejectBooking: (bookingId: string) => void;
  onBulkUploadPlots: (parsedPlots: Plot[]) => void;
}

export const SocietyDashboard: React.FC<SocietyDashboardProps> = ({
  society,
  plots,
  bookings,
  onAddPlot,
  onUpdatePlotStatus,
  onApproveBooking,
  onRejectBooking,
  onBulkUploadPlots
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'bookings' | 'bulk_upload' | 'analytics'>('inventory');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Plot Form state
  const [plotNumber, setPlotNumber] = useState('');
  const [sector, setSector] = useState('Sector A');
  const [block, setBlock] = useState('Executive');
  const [sizeMarla, setSizeMarla] = useState(5);
  const [pricePKR, setPricePKR] = useState(2500000);
  const [category, setCategory] = useState<'residential' | 'commercial'>('residential');

  const societyPlots = plots.filter(p => p.societyId === society.id || true);
  const societyBookings = bookings.filter(b => b.societyId === society.id || true);

  const totalSold = societyPlots.filter(p => p.status === 'sold').length;
  const totalReserved = societyPlots.filter(p => p.status === 'reserved').length;
  const totalAvailable = societyPlots.filter(p => p.status === 'available').length;

  const totalRevenuePKR = societyBookings.reduce((sum, b) => sum + b.totalPricePKR, 0);

  const handleCreatePlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPlot({
      societyId: society.id,
      societyName: society.name,
      plotNumber: plotNumber || `A-${Math.floor(Math.random() * 90 + 10)}`,
      sector,
      block,
      sizeMarla,
      sizeSqFt: sizeMarla * 225,
      pricePKR,
      downPaymentPKR: Math.round(pricePKR * 0.2),
      monthlyInstallmentPKR: Math.round((pricePKR * 0.8) / 48),
      installmentMonths: 48,
      status: 'available',
      category,
      dimensions: sizeMarla === 5 ? '25x45' : '35x65',
      features: ['Main Boulevard', '100ft Road Access'],
      coordinates: { x: Math.floor(Math.random() * 5 + 1), y: Math.floor(Math.random() * 4 + 1) }
    });

    setShowAddModal(false);
    setPlotNumber('');
  };

  const handleSimulateCSVUpload = () => {
    const mockCSVPlots: Plot[] = Array.from({ length: 5 }, (_, i) => ({
      id: `plot-csv-${Date.now()}-${i}`,
      societyId: society.id,
      societyName: society.name,
      plotNumber: `CSV-0${i + 1}`,
      sector: 'Sector B',
      block: 'Rose Block',
      sizeMarla: 5,
      sizeSqFt: 1125,
      pricePKR: 2600000,
      downPaymentPKR: 520000,
      monthlyInstallmentPKR: 43333,
      installmentMonths: 48,
      status: 'available',
      category: 'residential',
      dimensions: '25x45',
      features: ['Bulk CSV Imported'],
      coordinates: { x: i + 1, y: 3 }
    }));

    onBulkUploadPlots(mockCSVPlots);
    alert('Bulk CSV Upload Simulated: 5 new plots successfully added to Al-Rehman Garden inventory!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-900 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-0.5 rounded border border-emerald-200">
                Housing Society Admin Portal
              </span>
              <span className="text-slate-500 text-xs">{society.name}</span>
            </div>
            <h2 className="text-2xl font-black font-[Outfit] text-slate-900 mt-1">Plot Inventory & Booking Approvals</h2>
            <p className="text-xs text-slate-500">Manage plot masterplans, approve buyer online bookings, and upload CSV inventories.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Plot</span>
            </button>

            <button
              onClick={handleSimulateCSVUpload}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-xs border border-slate-200 flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Bulk CSV Upload</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs pt-1">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] block font-bold">Total Plot Inventory</span>
            <span className="text-xl font-black text-slate-900 block mt-0.5 font-[Outfit]">{societyPlots.length} Plots</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] block font-bold">Available Plots</span>
            <span className="text-xl font-black text-emerald-700 block mt-0.5 font-[Outfit]">{totalAvailable} Available</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] block font-bold">Sold / Reserved Plots</span>
            <span className="text-xl font-black text-amber-700 block mt-0.5 font-[Outfit]">
              {totalSold} Sold ({totalReserved} Reserved)
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] block font-bold">Total Booking Value</span>
            <span className="text-xl font-black text-amber-800 block mt-0.5 font-[Outfit]">
              PKR {(totalRevenuePKR / 1000000).toFixed(2)} Million
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-sm font-bold">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'inventory' ? 'border-amber-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Plot Inventory Table ({societyPlots.length})
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'bookings' ? 'border-amber-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Pending Booking Approvals ({societyBookings.length})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'analytics' ? 'border-amber-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          6-Month Booking Trends (Recharts)
        </button>
      </div>

      {/* Tab 3: 6-Month Booking Trends Widget */}
      {activeTab === 'analytics' && (
        <SocietyBookingTrendsWidget
          society={society}
          bookings={bookings}
          plots={plots}
        />
      )}

      {/* Tab 1: Plot Inventory Table */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <th className="p-3">Plot #</th>
                  <th className="p-3">Sector / Block</th>
                  <th className="p-3">Size (Marla)</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price (PKR)</th>
                  <th className="p-3">Down Payment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Quick Status Switch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {societyPlots.map(plot => (
                  <tr key={plot.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900">{plot.plotNumber}</td>
                    <td className="p-3 text-slate-600">{plot.sector} ({plot.block})</td>
                    <td className="p-3 font-bold">{plot.sizeMarla} Marla</td>
                    <td className="p-3 uppercase text-[10px] font-bold text-slate-500">{plot.category}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">
                      PKR {plot.pricePKR.toLocaleString('en-PK')}
                    </td>
                    <td className="p-3 text-slate-600 font-semibold">
                      PKR {plot.downPaymentPKR.toLocaleString('en-PK')}
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        plot.status === 'available' ? 'bg-emerald-100 text-emerald-800' :
                        plot.status === 'reserved' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {plot.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <select
                        value={plot.status}
                        onChange={e => onUpdatePlotStatus(plot.id, e.target.value as any)}
                        className="bg-slate-100 border border-slate-300 rounded px-2 py-1 text-[11px] font-bold"
                      >
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="sold">Sold</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Booking Requests */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <th className="p-3">Booking ID</th>
                  <th className="p-3">Buyer Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Plot #</th>
                  <th className="p-3">Total Cost</th>
                  <th className="p-3">Down Payment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Approve / Reject</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {societyBookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900">{b.id}</td>
                    <td className="p-3 font-bold text-slate-900">{b.buyerName}</td>
                    <td className="p-3 text-slate-600">{b.buyerPhone}</td>
                    <td className="p-3 font-bold text-amber-600">{b.plotNumber} ({b.sector})</td>
                    <td className="p-3 font-mono font-bold">PKR {b.totalPricePKR.toLocaleString('en-PK')}</td>
                    <td className="p-3 text-emerald-700 font-bold">PKR {b.downPaymentPKR.toLocaleString('en-PK')}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        b.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {b.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onApproveBooking(b.id)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2.5 py-1 rounded text-[11px]"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onRejectBooking(b.id)}
                            className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold px-2.5 py-1 rounded text-[11px]"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Decision Recorded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Plot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-slate-900 shadow-2xl relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold font-[Outfit] text-slate-900 mb-4">Add Plot to Society Inventory</h3>

            <form onSubmit={handleCreatePlotSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Plot Number (e.g. A-15)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A-15"
                  value={plotNumber}
                  onChange={e => setPlotNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sector</label>
                  <input
                    type="text"
                    required
                    value={sector}
                    onChange={e => setSector(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Block</label>
                  <input
                    type="text"
                    required
                    value={block}
                    onChange={e => setBlock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Plot Size (Marla)</label>
                  <select
                    value={sizeMarla}
                    onChange={e => setSizeMarla(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    <option value={3}>3 Marla</option>
                    <option value={5}>5 Marla</option>
                    <option value={10}>10 Marla</option>
                    <option value={20}>20 Marla (1 Kanal)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price (PKR)</label>
                  <input
                    type="number"
                    required
                    value={pricePKR}
                    onChange={e => setPricePKR(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-2.5 rounded-xl shadow-md transition-all mt-2"
              >
                Save Plot to Inventory
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
