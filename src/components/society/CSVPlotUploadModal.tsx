import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Plot, Society } from '../../types';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Download, 
  AlertCircle,
  FileText,
  HelpCircle,
  Layers,
  ArrowRight
} from 'lucide-react';

interface CSVPlotUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  society: Society;
  existingPlots: Plot[];
  onImportPlots: (validPlots: Plot[]) => void;
}

interface ParsedRow {
  rowNumber: number;
  plotNumber: string;
  block: string;
  size: string | number;
  sizeUnit: string;
  category: string;
  status: string;
  basePrice: string | number;
  sector?: string;
  dimensions?: string;
  features?: string;
  isValid: boolean;
  errors: string[];
  isDuplicate: boolean;
  plotObject?: Plot;
}

export const CSVPlotUploadModal: React.FC<CSVPlotUploadModalProps> = ({
  isOpen,
  onClose,
  society,
  existingPlots,
  onImportPlots
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [filterMode, setFilterMode] = useState<'all' | 'valid' | 'invalid' | 'duplicate'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Download Sample CSV template
  const handleDownloadSample = () => {
    const sampleHeaders = 'Plot Number,Block,Size,Size Unit,Category,Status,Base Price (PKR),Sector,Dimensions,Features\n';
    const sampleData = [
      `B-01,Executive Block,5,Marla,residential,available,2750000,Sector A,25x45,"Main Boulevard, Park Facing"`,
      `B-02,Executive Block,5,Marla,residential,available,2600000,Sector A,25x45,"Near Mosque, West Open"`,
      `B-03,Executive Block,10,Marla,residential,available,5200000,Sector A,35x65,"Corner Plot, 50ft Road"`,
      `B-04,Rose Block,1,Kanal,residential,available,9500000,Sector B,50x90,"Lake View, Gated"`,
      `C-01,Commercial Block,4,Marla,commercial,available,6500000,Sector A,20x45,"Main Commercial Hub, Facing Plaza"`
    ].join('\n');

    const blob = new Blob([sampleHeaders + sampleData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${society.name.replace(/\s+/g, '_')}_Plot_Inventory_Template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to validate and parse single row
  const validateAndParseRow = (
    row: any, 
    index: number, 
    seenKeysInFile: Set<string>
  ): ParsedRow => {
    const rowNum = index + 1;
    const errors: string[] = [];
    let isDuplicate = false;

    // Normalizing column names (handle loose key matches)
    const getVal = (keys: string[]) => {
      for (const k of keys) {
        for (const rowKey of Object.keys(row)) {
          if (rowKey.toLowerCase().replace(/[^a-z0-9]/g, '') === k.toLowerCase().replace(/[^a-z0-9]/g, '')) {
            return String(row[rowKey] || '').trim();
          }
        }
      }
      return '';
    };

    const plotNumber = getVal(['plotnumber', 'plotno', 'plot', 'number']);
    const block = getVal(['block', 'blockname', 'phase']) || 'Executive Block';
    const rawSize = getVal(['size', 'plotsize', 'marla', 'kanal', 'area']);
    const rawUnit = getVal(['sizeunit', 'unit']) || (rawSize.toLowerCase().includes('kanal') ? 'Kanal' : 'Marla');
    const rawCategory = getVal(['category', 'type', 'propertytype']) || 'residential';
    const rawStatus = getVal(['status', 'availability']) || 'available';
    const rawPrice = getVal(['baseprice', 'price', 'pricepkr', 'demand', 'rate']);
    const sector = getVal(['sector', 'sectorname']) || 'Sector A';
    const dimensions = getVal(['dimensions', 'size_dim']) || '25x45';
    const features = getVal(['features', 'amenities']) || 'Standard Demarcated Lot';

    // 1. Missing Plot Number
    if (!plotNumber) {
      errors.push('Missing Plot Number');
    }

    // 2. Missing Block
    if (!block) {
      errors.push('Missing Block Name');
    }

    // 3. Size Validation
    const cleanSizeNum = parseFloat(rawSize.replace(/[^0-9.]/g, ''));
    if (isNaN(cleanSizeNum) || cleanSizeNum <= 0) {
      errors.push('Invalid Size: must be a positive number');
    }

    // Compute Marla and SqFt
    const isKanal = rawUnit.toLowerCase().includes('kanal');
    const sizeMarla = isKanal ? cleanSizeNum * 20 : cleanSizeNum;
    const sizeSqFt = sizeMarla * 225;

    // 4. Category Validation
    const normalizedCategory = rawCategory.toLowerCase();
    let category: 'residential' | 'commercial' | 'plot_file' = 'residential';
    if (normalizedCategory.includes('commercial')) {
      category = 'commercial';
    } else if (normalizedCategory.includes('file') || normalizedCategory.includes('plot_file')) {
      category = 'plot_file';
    } else if (normalizedCategory.includes('residential') || normalizedCategory.includes('house') || normalizedCategory.includes('plot')) {
      category = 'residential';
    } else if (rawCategory) {
      errors.push(`Invalid Category "${rawCategory}" (Allowed: Residential, Commercial, Plot File)`);
    }

    // 5. Status Validation
    const normalizedStatus = rawStatus.toLowerCase();
    let status: 'available' | 'assigned' | 'reserved' | 'sold' | 'disputed' = 'available';
    if (['available', 'assigned', 'reserved', 'sold', 'disputed'].includes(normalizedStatus)) {
      status = normalizedStatus as any;
    } else if (normalizedStatus.includes('open') || normalizedStatus.includes('vacant')) {
      status = 'available';
    } else if (rawStatus) {
      errors.push(`Invalid Status "${rawStatus}" (Allowed: Available, Assigned, Reserved, Sold, Disputed)`);
    }

    // 6. Base Price Validation
    const cleanPrice = parseFloat(rawPrice.replace(/[^0-9.]/g, ''));
    if (isNaN(cleanPrice) || cleanPrice <= 0) {
      errors.push('Invalid Base Price: must be a positive numeric amount (PKR)');
    }

    // 7. Duplicate Plot Prevention Check (Society + Block + Plot Number)
    if (plotNumber && block) {
      const compositeKey = `${society.id.toLowerCase()}_${block.toLowerCase()}_${plotNumber.toLowerCase()}`;
      
      // Check duplicate against current database for this society
      const existsInDb = existingPlots.some(
        p => p.societyId === society.id && 
             p.block?.toLowerCase() === block.toLowerCase() && 
             p.plotNumber.toLowerCase() === plotNumber.toLowerCase()
      );

      // Check duplicate within the uploaded CSV itself
      const existsInFile = seenKeysInFile.has(compositeKey);

      if (existsInDb) {
        isDuplicate = true;
        errors.push(`Duplicate Plot: "${plotNumber}" already exists in ${block} for this Society`);
      } else if (existsInFile) {
        isDuplicate = true;
        errors.push(`Duplicate Row: Plot "${plotNumber}" in ${block} is repeated in this file`);
      } else {
        seenKeysInFile.add(compositeKey);
      }
    }

    const isValid = errors.length === 0;

    let plotObject: Plot | undefined;
    if (isValid) {
      const price = cleanPrice;
      const downpayment = Math.round(price * 0.20);
      const monthly = Math.round((price * 0.80) / 36);

      plotObject = {
        id: `plot-csv-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
        societyId: society.id,
        societyName: society.name,
        plotNumber: plotNumber,
        sector: sector,
        block: block,
        sizeMarla: sizeMarla,
        sizeUnit: isKanal ? 'Kanal' : 'Marla',
        sizeValue: cleanSizeNum,
        sizeSqFt: sizeSqFt,
        pricePKR: price,
        basePrice: price,
        downPaymentPKR: downpayment,
        monthlyInstallmentPKR: monthly,
        installmentMonths: 36,
        status: status,
        category: category,
        dimensions: dimensions || (sizeMarla === 5 ? '25x45' : sizeMarla === 10 ? '35x65' : '50x90'),
        features: features.split(',').map(f => f.trim()).filter(Boolean),
        coordinates: {
          x: Math.floor(Math.random() * 80) + 10,
          y: Math.floor(Math.random() * 80) + 10
        }
      };
    }

    return {
      rowNumber: rowNum,
      plotNumber: plotNumber || `Row #${rowNum}`,
      block: block || 'Unknown',
      size: rawSize || '-',
      sizeUnit: isKanal ? 'Kanal' : 'Marla',
      category: rawCategory || 'residential',
      status: rawStatus || 'available',
      basePrice: cleanPrice || rawPrice || 0,
      sector,
      dimensions,
      features,
      isValid,
      errors,
      isDuplicate,
      plotObject
    };
  };

  // Parse CSV or Text
  const processData = (content: string) => {
    setIsProcessing(true);
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        const seenKeysInFile = new Set<string>();
        const parsed: ParsedRow[] = results.data.map((row: any, i: number) => 
          validateAndParseRow(row, i, seenKeysInFile)
        );
        setParsedRows(parsed);
        setIsProcessing(false);
        setActiveStep(2);
      },
      error: (err) => {
        alert('Error parsing CSV file: ' + err.message);
        setIsProcessing(false);
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawText(text);
      processData(text);
    };
    reader.readAsText(selectedFile);
  };

  const handlePasteProcess = () => {
    if (!rawText.trim()) return;
    processData(rawText);
  };

  // Metrics
  const totalRows = parsedRows.length;
  const validRows = parsedRows.filter(r => r.isValid);
  const invalidRows = parsedRows.filter(r => !r.isValid && !r.isDuplicate);
  const duplicateRows = parsedRows.filter(r => r.isDuplicate);

  // Filter rows for display
  const displayedRows = parsedRows.filter(r => {
    if (filterMode === 'valid') return r.isValid;
    if (filterMode === 'invalid') return !r.isValid && !r.isDuplicate;
    if (filterMode === 'duplicate') return r.isDuplicate;
    return true;
  });

  const handleConfirmImport = () => {
    const validPlotsToInsert = validRows
      .map(r => r.plotObject)
      .filter((p): p is Plot => p !== undefined);

    if (validPlotsToInsert.length === 0) {
      alert('No valid plots to import. Please review errors.');
      return;
    }

    onImportPlots(validPlotsToInsert);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">CSV / Excel Plot Inventory Upload</h2>
              <p className="text-xs text-slate-300">
                Bulk import demarcated inventory for <strong className="text-amber-400">{society.name}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveStep(1)}
              className={`flex items-center gap-2 font-bold cursor-pointer transition ${
                activeStep === 1 ? 'text-emerald-800' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                activeStep === 1 ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}>1</span>
              <span>Select or Paste CSV / Excel</span>
            </button>

            <span className="text-slate-300">&rarr;</span>

            <button
              onClick={() => parsedRows.length > 0 && setActiveStep(2)}
              disabled={parsedRows.length === 0}
              className={`flex items-center gap-2 font-bold transition ${
                activeStep === 2 ? 'text-emerald-800' : parsedRows.length > 0 ? 'text-slate-500 hover:text-slate-900 cursor-pointer' : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                activeStep === 2 ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}>2</span>
              <span>Validation Preview & Duplicate Detection</span>
            </button>
          </div>

          <button
            onClick={handleDownloadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold transition shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Download Sample CSV Template</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {activeStep === 1 ? (
            <div className="space-y-6">
              
              {/* File Upload Box */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-3xl p-8 text-center bg-slate-50/50 hover:bg-emerald-50/30 transition cursor-pointer group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv,.txt"
                  className="hidden"
                />
                <div className="w-14 h-14 mx-auto rounded-3xl bg-white group-hover:bg-emerald-100 text-slate-400 group-hover:text-emerald-700 flex items-center justify-center shadow-xs transition mb-3">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-900">
                  {file ? file.name : 'Click to select CSV / Excel file or drag and drop'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Supports comma-separated .csv or spreadsheet text files (Up to 5,000 plots per batch)
                </p>
              </div>

              {/* Or Paste Raw CSV Text */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Or Paste Comma-Separated (CSV) Rows Directly</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Header: Plot Number, Block, Size, Category, Status, Base Price</span>
                </div>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Plot Number,Block,Size,Category,Status,Base Price&#10;B-01,Executive Block,5,residential,available,2750000&#10;B-02,Executive Block,5,residential,available,2600000&#10;B-03,Rose Block,10,residential,available,5200000"
                  rows={6}
                  className="w-full text-xs font-mono p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handlePasteProcess}
                    disabled={!rawText.trim() || isProcessing}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-2"
                  >
                    <span>Validate & Preview Plots</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Field Reference Guide */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 text-slate-600">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-emerald-700" />
                  <span>Required CSV Column Schema & Formats</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div><strong className="text-slate-900">Plot Number:</strong> e.g. A-01, 142, B-99</div>
                  <div><strong className="text-slate-900">Block:</strong> e.g. Executive Block, Rose Block</div>
                  <div><strong className="text-slate-900">Size:</strong> 3, 5, 10, 20 (or 1 Kanal)</div>
                  <div><strong className="text-slate-900">Category:</strong> residential, commercial, plot_file</div>
                  <div><strong className="text-slate-900">Status:</strong> available, assigned, reserved, sold</div>
                  <div><strong className="text-slate-900">Base Price:</strong> Numeric amount in PKR</div>
                </div>
              </div>

            </div>
          ) : (
            /* Step 2: Preview & Validation */
            <div className="space-y-6">
              
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div 
                  onClick={() => setFilterMode('all')}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    filterMode === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="text-[11px] font-bold uppercase opacity-80">Total Parsed Rows</div>
                  <div className="text-2xl font-black mt-1">{totalRows}</div>
                </div>

                <div 
                  onClick={() => setFilterMode('valid')}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    filterMode === 'valid' ? 'bg-emerald-800 text-white border-emerald-800 ring-2 ring-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div className="text-[11px] font-bold uppercase flex items-center justify-between">
                    <span>Ready for Import</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-2xl font-black mt-1">{validRows.length} Plots</div>
                </div>

                <div 
                  onClick={() => setFilterMode('invalid')}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    filterMode === 'invalid' ? 'bg-rose-800 text-white border-rose-800 ring-2 ring-rose-400' : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="text-[11px] font-bold uppercase flex items-center justify-between">
                    <span>Validation Errors</span>
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-2xl font-black mt-1">{invalidRows.length} Rows</div>
                </div>

                <div 
                  onClick={() => setFilterMode('duplicate')}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    filterMode === 'duplicate' ? 'bg-amber-800 text-white border-amber-800 ring-2 ring-amber-400' : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="text-[11px] font-bold uppercase flex items-center justify-between">
                    <span>Duplicates Flagged</span>
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-2xl font-black mt-1">{duplicateRows.length} Plots</div>
                </div>
              </div>

              {/* Duplicate or Error Notice Banner */}
              {(invalidRows.length > 0 || duplicateRows.length > 0) && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Safe Import Notice: Invalid & Duplicate Rows are Automatically Excluded</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    Only the <strong>{validRows.length} verified valid plots</strong> will be imported into {society.name}'s master database. Duplicates matching (Society + Block + Plot Number) are blocked to maintain ledger integrity.
                  </p>
                </div>
              )}

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider sticky top-0">
                      <tr>
                        <th className="p-3">Row</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Plot #</th>
                        <th className="p-3">Block</th>
                        <th className="p-3">Size</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Base Price (PKR)</th>
                        <th className="p-3">Validation Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayedRows.map((row) => (
                        <tr 
                          key={row.rowNumber} 
                          className={
                            row.isValid 
                              ? 'hover:bg-slate-50' 
                              : row.isDuplicate 
                              ? 'bg-amber-50/50 hover:bg-amber-100/40' 
                              : 'bg-rose-50/50 hover:bg-rose-100/40'
                          }
                        >
                          <td className="p-3 font-mono text-slate-500 font-semibold">{row.rowNumber}</td>
                          <td className="p-3">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Valid</span>
                              </span>
                            ) : row.isDuplicate ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>Duplicate</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                                <AlertCircle className="w-3 h-3 text-rose-600" />
                                <span>Invalid</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-bold text-slate-900">{row.plotNumber}</td>
                          <td className="p-3 font-medium text-slate-800">{row.block}</td>
                          <td className="p-3">{row.size} {row.sizeUnit}</td>
                          <td className="p-3 capitalize">{row.category}</td>
                          <td className="p-3 font-bold text-emerald-900">
                            PKR {typeof row.basePrice === 'number' ? row.basePrice.toLocaleString('en-PK') : row.basePrice}
                          </td>
                          <td className="p-3">
                            {row.errors.length > 0 ? (
                              <ul className="text-[11px] text-rose-700 list-disc list-inside space-y-0.5">
                                {row.errors.map((err, i) => (
                                  <li key={i} className={row.isDuplicate ? 'text-amber-800 font-semibold' : 'text-rose-700 font-semibold'}>
                                    {err}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-emerald-700 text-[11px] font-medium">Ready to import</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            {activeStep === 2 && (
              <span>
                Selected: <strong className="text-emerald-800">{validRows.length} valid plots</strong> ready to commit into inventory.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
            >
              Cancel
            </button>

            {activeStep === 2 && (
              <button
                onClick={() => setActiveStep(1)}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                &larr; Re-upload File
              </button>
            )}

            {activeStep === 2 ? (
              <button
                onClick={handleConfirmImport}
                disabled={validRows.length === 0}
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Import {validRows.length} Valid Plots</span>
              </button>
            ) : (
              <button
                onClick={handlePasteProcess}
                disabled={!rawText.trim()}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Proceed to Validation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
