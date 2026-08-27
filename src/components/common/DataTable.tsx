import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Filter, 
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor?: (row: T) => any;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (row: T) => string;
  title?: string;
  description?: string;
  searchPlaceholder?: string;
  filterOptions?: {
    key: string;
    label: string;
    options: { value: string; label: string }[];
  }[];
  roleAccent?: 'indigo' | 'emerald' | 'teal' | 'amber';
  onRowClick?: (row: T) => void;
  actions?: {
    label: string;
    icon?: React.ElementType;
    onClick?: (row: T) => void;
    variant?: 'default' | 'danger' | 'success';
  }[];
  onExportCsv?: () => void;
  initialSortKey?: string;
  initialSortDir?: 'asc' | 'desc';
  pageSizeOptions?: number[];
  defaultPageSize?: number;
}

export function DataTable<T extends Record<string, any>>({
  data = [],
  columns = [],
  keyExtractor,
  title,
  description,
  searchPlaceholder = 'Search records...',
  filterOptions = [],
  roleAccent = 'indigo',
  onRowClick,
  actions = [],
  onExportCsv,
  initialSortKey,
  initialSortDir = 'asc',
  pageSizeOptions = [5, 10, 25, 50],
  defaultPageSize = 10,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | null>(initialSortKey || (columns[0]?.key ?? null));
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(initialSortDir);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Filter handlers
  const handleFilterChange = (filterKey: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setCurrentPage(1);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Filtered and Sorted Data
  const filteredData = useMemo(() => {
    return data.filter(row => {
      // Global text search across all values
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesSearch = Object.values(row).some(val => {
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(query);
        });
        if (!matchesSearch) return false;
      }

      // Dropdown filters
      for (const [key, filterVal] of Object.entries(activeFilters)) {
        if (filterVal && filterVal !== 'all') {
          const rowVal = String((row as Record<string, unknown>)[key] ?? '');
          if (rowVal.toLowerCase() !== String(filterVal).toLowerCase()) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, searchTerm, activeFilters]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const colDef = columns.find(c => c.key === sortKey);

    return [...filteredData].sort((a, b) => {
      const valA = colDef?.accessor ? colDef.accessor(a) : a[sortKey];
      const valB = colDef?.accessor ? colDef.accessor(b) : b[sortKey];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortDir === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filteredData, sortKey, sortDir, columns]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Accent styles
  const accentClasses = {
    indigo: {
      btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      border: 'focus:border-indigo-500 focus:ring-indigo-500/20',
      activePage: 'bg-indigo-600 text-white border-indigo-600',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    emerald: {
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      border: 'focus:border-emerald-500 focus:ring-emerald-500/20',
      activePage: 'bg-emerald-600 text-white border-emerald-600',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    teal: {
      btn: 'bg-teal-600 hover:bg-teal-700 text-white',
      border: 'focus:border-teal-500 focus:ring-teal-500/20',
      activePage: 'bg-teal-600 text-white border-teal-600',
      badge: 'bg-teal-50 text-teal-700 border-teal-200'
    },
    amber: {
      btn: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold',
      border: 'focus:border-amber-500 focus:ring-amber-500/20',
      activePage: 'bg-amber-500 text-slate-950 font-bold border-amber-500',
      badge: 'bg-amber-50 text-amber-800 border-amber-200'
    }
  }[roleAccent];

  // Default export to CSV handler
  const handleDefaultCsvExport = () => {
    if (onExportCsv) {
      onExportCsv();
      return;
    }
    if (!sortedData.length) return;

    const headers = columns.map(c => `"${c.header}"`).join(',');
    const rows = sortedData.map(row => {
      return columns.map(c => {
        const val = c.accessor ? c.accessor(row) : row[c.key];
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title?.toLowerCase().replace(/\s+/g, '_') || 'data_export'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Header bar */}
      {(title || description || onExportCsv || true) && (
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-bold text-slate-900">{title}</h3>}
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDefaultCsvExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* Toolbar: Search and Filter select boxes */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className={`w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg outline-none transition ${accentClasses.border}`}
          />
        </div>

        {filterOptions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {filterOptions.map((filter) => (
              <div key={filter.key} className="flex items-center gap-1">
                <select
                  value={activeFilters[filter.key] || 'all'}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className={`text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 outline-none font-medium text-slate-700 transition ${accentClasses.border}`}
                >
                  <option value="all">All {filter.label}s</option>
                  {filter.options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {(searchTerm || Object.values(activeFilters).some(v => v !== 'all')) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveFilters({});
                  setCurrentPage(1);
                }}
                className="text-xs text-slate-500 hover:text-slate-900 underline px-2 py-1"
              >
                Reset filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={`p-3.5 font-semibold select-none ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {col.sortable !== false ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1 hover:text-slate-800 transition cursor-pointer"
                    >
                      <span>{col.header}</span>
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-700" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-700" />
                        )
                      ) : (
                        <ChevronsUpDown className="w-3 h-3 text-slate-300" />
                      )}
                    </button>
                  ) : (
                    <span>{col.header}</span>
                  )}
                </th>
              ))}

              {actions.length > 0 && (
                <th className="p-3.5 text-right font-semibold">Actions</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="p-8 text-center text-slate-400"
                >
                  No records matching your search or filters.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={keyExtractor(row) || idx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`hover:bg-slate-50/80 transition ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col) => {
                    const value = col.accessor ? col.accessor(row) : row[col.key];
                    return (
                      <td
                        key={col.key}
                        className={`p-3.5 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                      >
                        {col.render ? col.render(value, row) : (value ?? '-')}
                      </td>
                    );
                  })}

                  {actions.length > 0 && (
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                        {actions.map((act, aIdx) => {
                          const IconComp = act.icon || Eye;
                          return (
                            <button
                              key={aIdx}
                              onClick={() => act.onClick && act.onClick(row)}
                              title={act.label}
                              className={`p-1.5 rounded-lg border transition ${
                                act.variant === 'danger'
                                  ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                                  : act.variant === 'success'
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <IconComp className="w-3.5 h-3.5" />
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span>
            Showing <strong className="text-slate-800">{sortedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
            <strong className="text-slate-800">{Math.min(currentPage * pageSize, sortedData.length)}</strong> of{' '}
            <strong className="text-slate-800">{sortedData.length}</strong> records
          </span>

          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-slate-400">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-xs bg-white border border-slate-200 rounded-md px-1.5 py-1 text-slate-700 outline-none"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:pointer-events-none transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:pointer-events-none transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
