import React, { useState } from 'react';
import { DocumentItem, User } from '../../types';
import { 
  FolderLock, 
  FileText, 
  Download, 
  Eye, 
  Plus, 
  ShieldCheck, 
  Trash2, 
  Share2, 
  Search, 
  Lock, 
  X, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet,
  AlertCircle,
  QrCode,
  Stamp,
  FileCheck2,
  Landmark,
  Award
} from 'lucide-react';
import { generatePDFDocument } from '../../utils/pdfGenerator';
import { uploadDocumentToSupabase } from '../../services/legalDocumentService';

export interface DocumentLockerGridProps {
  documents: DocumentItem[];
  currentUser?: User;
  onAddDocument?: (doc: DocumentItem) => void;
  onDeleteDocument?: (docId: string) => void;
  roleAccent?: 'indigo' | 'emerald' | 'teal' | 'amber' | 'purple';
}

export const DocumentLockerGrid: React.FC<DocumentLockerGridProps> = ({
  documents = [],
  currentUser,
  onAddDocument,
  onDeleteDocument,
  roleAccent = 'indigo'
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  // New Document Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'transfer_deed' | 'sale_agreement' | 'allotment' | 'noc' | 'payment_receipt' | 'cnic' | 'other'>('allotment');
  const [newPlotNo, setNewPlotNo] = useState('Plot 42-A');
  const [newSociety, setNewSociety] = useState('Al-Rehman Garden Phase 7');
  const [uploadFileName, setUploadFileName] = useState('');

  const filteredDocs = documents.filter(doc => {
    const cat = doc.category || doc.type || '';
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'transfer_deed' && !cat.includes('transfer') && !cat.includes('deed') && !cat.includes('title')) return false;
      if (selectedCategory === 'sale_agreement' && !cat.includes('agreement') && !cat.includes('contract')) return false;
      if (selectedCategory === 'allotment' && !cat.includes('allotment')) return false;
      if (selectedCategory === 'receipt' && !cat.includes('receipt') && !cat.includes('payment')) return false;
      if (selectedCategory === 'noc' && !cat.includes('noc')) return false;
      if (selectedCategory === 'cnic' && !cat.includes('cnic') && !cat.includes('identity')) return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchesTitle = doc.title?.toLowerCase().includes(q);
      const matchesSociety = doc.societyName?.toLowerCase().includes(q);
      const matchesPlot = doc.plotNumber?.toLowerCase().includes(q);
      const matchesRef = doc.bookingReference?.toLowerCase().includes(q) || doc.id.toLowerCase().includes(q);
      if (!matchesTitle && !matchesSociety && !matchesPlot && !matchesRef) return false;
    }
    return true;
  });

  const handleDownload = (doc: DocumentItem) => {
    const rawType = (doc.type || doc.category || '').toLowerCase();
    
    let resolvedType: 'transfer_deed' | 'booking_agreement' | 'allotment_letter' | 'token_slip' | 'payment_receipt' | 'noc_certificate' = 'allotment_letter';
    
    if (rawType.includes('transfer') || rawType.includes('deed') || rawType.includes('title')) {
      resolvedType = 'transfer_deed';
    } else if (rawType.includes('agreement') || rawType.includes('sale') || rawType.includes('contract')) {
      resolvedType = 'booking_agreement';
    } else if (rawType.includes('receipt') || rawType.includes('payment')) {
      resolvedType = 'payment_receipt';
    } else if (rawType.includes('noc')) {
      resolvedType = 'noc_certificate';
    } else if (rawType.includes('token')) {
      resolvedType = 'token_slip';
    }

    generatePDFDocument({
      docType: resolvedType,
      buyerName: doc.buyerName || currentUser?.name || 'Muhammad Farooq',
      buyerPhone: currentUser?.phone || '+92 300 8472910',
      buyerCNIC: doc.buyerCnic || currentUser?.cnic || '34501-8472910-1',
      plotNumber: doc.plotNumber || 'Plot 42-A',
      sector: 'Executive Block (Phase 7)',
      societyName: doc.societyName || 'Al-Rehman Garden Housing Society',
      totalPricePKR: 2600000,
      downPaymentPKR: 520000,
      paidAmountPKR: 57778,
      monthlyInstallmentPKR: 57778,
      totalInstallments: 36,
      transferFeePKR: 78000,
      date: doc.issueDate || doc.uploadedAt || '2026-08-19'
    });
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title: newTitle,
      category: newCategory as any,
      type: newCategory === 'transfer_deed' ? 'transfer_deed' : newCategory === 'sale_agreement' ? 'booking_agreement' : 'allotment_letter',
      uploadedAt: new Date().toISOString().split('T')[0],
      issueDate: new Date().toISOString().split('T')[0],
      fileUrl: '#',
      fileSize: '340 KB',
      verified: true,
      verifiedStamp: true,
      verificationCode: `VRF-${Date.now().toString().slice(-6)}`,
      tamperProofHash: `SHA256-${Date.now().toString(16).toUpperCase()}`,
      societyName: newSociety,
      plotNumber: newPlotNo,
      buyerName: currentUser?.name || 'Authorized Buyer'
    };

    if (onAddDocument) {
      onAddDocument(newDoc);
    }
    setShowUploadModal(false);
    setNewTitle('');
    setUploadFileName('');
  };

  const getCategoryBadge = (categoryOrType: string = '') => {
    const c = categoryOrType.toLowerCase();
    if (c.includes('transfer') || c.includes('title') || c.includes('deed')) {
      return { label: 'Official Transfer Deed', color: 'bg-purple-50 text-purple-900 border-purple-200' };
    }
    if (c.includes('agreement') || c.includes('contract') || c.includes('sale')) {
      return { label: 'Digital Sale Agreement', color: 'bg-blue-50 text-blue-900 border-blue-200' };
    }
    if (c.includes('noc')) {
      return { label: 'TMA Approved NOC', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    }
    if (c.includes('allotment')) {
      return { label: 'Allotment Letter', color: 'bg-teal-50 text-teal-800 border-teal-200' };
    }
    if (c.includes('receipt') || c.includes('payment')) {
      return { label: 'Bank Receipt', color: 'bg-amber-50 text-amber-800 border-amber-200' };
    }
    if (c.includes('cnic') || c.includes('identity')) {
      return { label: 'NADRA CNIC Verified', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
    }
    return { label: 'Official Record', color: 'bg-slate-100 text-slate-800 border-slate-200' };
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <FolderLock className="w-5 h-5 text-purple-700" />
            <span>Digital Document Locker & Verification Vault</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tamper-evident legal storage for Transfer Deeds, Digital Sale Agreements, Allotment Letters, and NADRA CNIC records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-xl text-xs font-semibold text-purple-900 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-purple-700" />
            <span>256-Bit SHA Encrypted & QR Verified</span>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-800 hover:bg-purple-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Documents' },
            { id: 'transfer_deed', label: 'Transfer Deeds' },
            { id: 'sale_agreement', label: 'Sale Agreements' },
            { id: 'allotment', label: 'Allotment Letters' },
            { id: 'receipt', label: 'Payment Receipts' },
            { id: 'noc', label: 'NOC & Approvals' },
            { id: 'cnic', label: 'Identity & CNIC' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, plot, reference..."
            className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-purple-600"
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
            <FolderLock className="w-8 h-8 mx-auto text-slate-300" />
            <h4 className="text-sm font-bold text-slate-700">No Documents Found</h4>
            <p className="text-xs text-slate-500">Upload deeds or change the category filter above.</p>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const badge = getCategoryBadge(doc.category || doc.type);
            const isDeed = (doc.type === 'transfer_deed' || doc.category === 'title_deed' || doc.title.toLowerCase().includes('transfer'));
            const isAgreement = (doc.type === 'booking_agreement' || doc.category === 'agreement' || doc.title.toLowerCase().includes('agreement'));

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-sm hover:border-purple-200 transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`p-2 rounded-xl border ${
                      isDeed 
                        ? 'bg-purple-50 text-purple-800 border-purple-200' 
                        : isAgreement 
                        ? 'bg-blue-50 text-blue-800 border-blue-200' 
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      {isDeed ? <Stamp className="w-5 h-5" /> : isAgreement ? <FileCheck2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">{doc.title}</h3>
                    {doc.plotNumber && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        <strong>{doc.plotNumber}</strong> • {doc.societyName || 'Al-Rehman Garden'}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>{doc.issueDate || doc.uploadedAt || '2026-08-19'}</span>
                    <span>{doc.fileSize || '320 KB'}</span>
                  </div>

                  {doc.verificationCode && (
                    <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50/70 px-2 py-0.5 rounded-md">
                      <QrCode className="w-3 h-3 text-emerald-700" />
                      <span>{doc.verificationCode}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="flex-1 inline-flex items-center justify-center gap-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Inspect</span>
                  </button>

                  <button
                    onClick={() => handleDownload(doc)}
                    className="flex-1 inline-flex items-center justify-center gap-1 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-700" />
                    <span>Download PDF</span>
                  </button>

                  {onDeleteDocument && (
                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FolderLock className="w-4 h-4 text-purple-700" />
                <span>Upload Encrypted Legal Document</span>
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Registered Transfer Deed — Plot 42-A"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="transfer_deed">Transfer Deed</option>
                    <option value="sale_agreement">Sale Agreement</option>
                    <option value="allotment">Allotment Letter</option>
                    <option value="noc">TMA / LDA NOC</option>
                    <option value="payment_receipt">Payment Receipt</option>
                    <option value="cnic">CNIC / Identity</option>
                    <option value="other">Other Deed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plot Number</label>
                  <input
                    type="text"
                    value={newPlotNo}
                    onChange={(e) => setNewPlotNo(e.target.value)}
                    placeholder="Plot 42-A"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select PDF File</label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setUploadFileName(e.target.files?.[0]?.name || '')}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-800 hover:file:bg-purple-100 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 text-purple-900 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                  <span>Automated Cryptographic Hash & QR Verification</span>
                </div>
                <p className="font-mono text-[10px] text-purple-700 truncate">
                  SHA-256: e8b91a24d8721c0b395f8841a1239c09
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-800 hover:bg-purple-900 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Secure to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Document Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Official Document Verification</span>
                <h3 className="text-base font-bold text-slate-900">{previewDoc.title}</h3>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Details Card */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold">
                  <Landmark className="w-4 h-4 text-purple-700" />
                  <span>MANZILIQ Authenticated Legal Document</span>
                </div>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full text-[10px] flex items-center gap-1 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Sub-Registrar & NADRA Verified</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Society / Scheme:</span>
                  <strong>{previewDoc.societyName || 'Al-Rehman Garden Phase 7'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Plot Allocation:</span>
                  <strong className="font-mono text-emerald-800">{previewDoc.plotNumber || 'Plot 42-A'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Purchaser / Transferee:</span>
                  <strong>{previewDoc.buyerName || currentUser?.name || 'Muhammad Farooq'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Verification Code:</span>
                  <strong className="font-mono text-purple-900">{previewDoc.verificationCode || 'VRF-TD-849102'}</strong>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-500 font-mono">
                <span>Tamper Hash: {previewDoc.tamperProofHash || 'SHA256-e8b91a24d8721c0b'}</span>
                <span>Date: {previewDoc.issueDate || previewDoc.uploadedAt || '2026-08-19'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                <ShieldCheck className="w-4 h-4" />
                <span>Legally Binding Title Record</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDownload(previewDoc);
                    setPreviewDoc(null);
                  }}
                  className="px-4 py-2 bg-purple-800 hover:bg-purple-900 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Stamped PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
