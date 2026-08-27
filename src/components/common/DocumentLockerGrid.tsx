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
  AlertCircle
} from 'lucide-react';
import { generatePDFDocument } from '../../utils/pdfGenerator';

export interface DocumentLockerGridProps {
  documents: DocumentItem[];
  currentUser?: User;
  onAddDocument?: (doc: DocumentItem) => void;
  onDeleteDocument?: (docId: string) => void;
  roleAccent?: 'indigo' | 'emerald' | 'teal' | 'amber';
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
  const [newCategory, setNewCategory] = useState<'noc' | 'allotment' | 'payment_receipt' | 'cnic' | 'other'>('allotment');
  const [newPlotNo, setNewPlotNo] = useState('Plot 42-A');
  const [newSociety, setNewSociety] = useState('Al-Rehman Garden');
  const [uploadFileName, setUploadFileName] = useState('');

  const filteredDocs = documents.filter(doc => {
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'noc' && doc.category !== 'noc') return false;
      if (selectedCategory === 'allotment' && doc.category !== 'allotment') return false;
      if (selectedCategory === 'receipt' && doc.category !== 'payment_receipt') return false;
      if (selectedCategory === 'cnic' && doc.category !== 'cnic') return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchesTitle = doc.title.toLowerCase().includes(q);
      const matchesSociety = doc.societyName?.toLowerCase().includes(q);
      const matchesPlot = doc.plotNumber?.toLowerCase().includes(q);
      if (!matchesTitle && !matchesSociety && !matchesPlot) return false;
    }
    return true;
  });

  const handleDownload = (doc: DocumentItem) => {
    generatePDFDocument({
      docType: doc.category === 'payment_receipt' ? 'payment_receipt' : 'allotment_letter',
      buyerName: currentUser?.name || 'Authorized Client',
      buyerPhone: currentUser?.phone || '+92 300 1234567',
      plotNumber: doc.plotNumber || 'Plot 42-A',
      societyName: doc.societyName || 'Al-Rehman Garden',
      totalPricePKR: 2600000,
      downPaymentPKR: 520000,
      paidAmountPKR: 100000,
      date: doc.uploadedAt || '2026-08-23'
    });
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      uploadedAt: new Date().toISOString().split('T')[0],
      fileUrl: '#',
      fileSize: '1.4 MB',
      verified: true,
      societyName: newSociety,
      plotNumber: newPlotNo
    };

    if (onAddDocument) {
      onAddDocument(newDoc);
    }
    setShowUploadModal(false);
    setNewTitle('');
    setUploadFileName('');
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'noc':
        return { label: 'TMA Approved NOC', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'allotment':
        return { label: 'Allotment Letter', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'payment_receipt':
        return { label: 'Bank Receipt', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'cnic':
        return { label: 'NADRA CNIC Verified', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      default:
        return { label: 'Official Record', color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <FolderLock className="w-5 h-5 text-indigo-600" />
            <span>Digital Vault & Document Locker</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Encrypted repository for verified deeds, TMA NOC certificates, bank payment receipts, and NADRA records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-600" />
            <span>256-Bit SHA Encrypted</span>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
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
            { id: 'noc', label: 'NOC & Approvals' },
            { id: 'allotment', label: 'Allotment Letters' },
            { id: 'receipt', label: 'Payment Receipts' },
            { id: 'cnic', label: 'Identity & CNIC' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === tab.id
                  ? 'bg-slate-900 text-white'
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
            placeholder="Search documents by title or plot..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200 p-8 space-y-2">
            <FolderLock className="w-8 h-8 mx-auto text-slate-300" />
            <h4 className="text-sm font-bold text-slate-700">No Documents Found</h4>
            <p className="text-xs text-slate-500">Upload deeds or filter by a different category.</p>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const badge = getCategoryBadge(doc.category);

            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-sm hover:border-indigo-200 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{doc.title}</h3>
                    {doc.plotNumber && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {doc.plotNumber} • {doc.societyName}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>Uploaded: {doc.uploadedAt}</span>
                    <span>{doc.fileSize || '1.2 MB'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => handleDownload(doc)}
                    className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>

                  {onDeleteDocument && (
                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FolderLock className="w-4 h-4 text-indigo-600" />
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
                  placeholder="e.g. Registered Sale Deed Transfer #8819"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
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
                <label className="block font-bold text-slate-700 mb-1">Select File (PDF / Scanned Image)</label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setUploadFileName(e.target.files?.[0]?.name || '')}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Automated Cryptographic Hash Verification</span>
                </div>
                <p className="font-mono text-[10px] text-slate-500 truncate">
                  SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs"
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
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Vault Inspection</span>
                <h3 className="text-base font-bold text-slate-900">{previewDoc.title}</h3>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated PDF Preview Paper */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4 font-serif text-slate-800">
              <div className="text-center pb-3 border-b border-slate-300">
                <h2 className="text-sm font-bold uppercase tracking-wider">Government of Punjab / Housing & Municipal Authority</h2>
                <p className="text-[11px] text-slate-600">Official Housing Project Verification Record</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Document Title:</span>
                  <strong>{previewDoc.title}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Society / Project:</span>
                  <strong>{previewDoc.societyName || 'Al-Rehman Garden'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Plot Allocation:</span>
                  <strong className="font-mono">{previewDoc.plotNumber || 'Plot 42-A'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Verification Stamp:</span>
                  <span className="text-emerald-700 font-bold">Verified & Authenticated</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Ref: MANZILIQ-{previewDoc.id.toUpperCase()}</span>
                <span>Date: {previewDoc.uploadedAt}</span>
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
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDownload(previewDoc);
                    setPreviewDoc(null);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Generate Official PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
