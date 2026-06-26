import { useState, useMemo } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx-js-style';
import {
  Download, FileSpreadsheet, FileText, File, CheckSquare, Square,
  CheckCircle2, Filter, Users, ListChecks, Zap, X
} from 'lucide-react';
import Button from '../ui/Button';

const ALL_FIELDS = [
  { key: 'firstName', label: 'First Name', group: 'Contact' },
  { key: 'lastName', label: 'Last Name', group: 'Contact' },
  { key: 'fullName', label: 'Full Name', group: 'Contact' },
  { key: 'email', label: 'Email', group: 'Contact' },
  { key: 'phone', label: 'Phone', group: 'Contact' },
  { key: 'company', label: 'Company', group: 'Company' },
  { key: 'jobTitle', label: 'Job Title', group: 'Company' },
  { key: 'source', label: 'Source', group: 'Lead Info' },
  { key: 'status', label: 'Status', group: 'Lead Info' },
  { key: 'notes', label: 'Notes', group: 'Lead Info' },
  { key: 'createdAt', label: 'Created Date', group: 'System' },
  { key: 'assignedToName', label: 'Assigned To', group: 'System' },
  { key: 'lastActivity', label: 'Last Activity', group: 'System' },
];

const SCOPES = [
  { value: 'all', label: 'All Leads', desc: 'Export your entire lead database', icon: Users },
  { value: 'selected', label: 'Selected Leads', desc: 'Export only selected leads', icon: CheckSquare },
  { value: 'filtered', label: 'Filtered Leads', desc: 'Export currently filtered results', icon: Filter },
];

const FORMATS = [
  { value: 'csv', label: 'CSV', desc: 'Comma-separated values', icon: FileText, ext: '.csv' },
  { value: 'excel', label: 'Excel', desc: 'Microsoft Excel workbook', icon: FileSpreadsheet, ext: '.xlsx' },
];

function RadioCard({ selected, onClick, icon: Icon, label, desc, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
        selected
          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-lg shadow-indigo-500/10'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? 'gradient-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className={`font-semibold text-sm ${selected ? 'text-indigo-700 dark:text-indigo-300' : ''}`}>{label}</p>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
        {selected && <CheckCircle2 className="w-5 h-5 text-indigo-500 ml-auto" />}
      </div>
    </button>
  );
}

export default function ExportLeads({ isOpen, onClose, leads, filteredLeads, selectedLeadIds }) {
  const [scope, setScope] = useState('all');
  const [format, setFormat] = useState('csv');
  const [selectedFields, setSelectedFields] = useState(
    ALL_FIELDS.filter(f => f.group !== 'System').map(f => f.key)
  );
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [exportInfo, setExportInfo] = useState(null);

  const dataToExport = useMemo(() => {
    if (scope === 'selected' && selectedLeadIds?.length > 0) {
      return leads.filter(l => selectedLeadIds.includes(l.id));
    }
    if (scope === 'filtered') return filteredLeads || leads;
    return leads;
  }, [scope, leads, filteredLeads, selectedLeadIds]);

  const toggleField = (key) => {
    setSelectedFields(prev =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    );
  };

  const selectAll = () => setSelectedFields(ALL_FIELDS.map(f => f.key));
  const deselectAll = () => setSelectedFields([]);

  const groups = useMemo(() => {
    const g = {};
    ALL_FIELDS.forEach(f => {
      if (!g[f.group]) g[f.group] = [];
      g[f.group].push(f);
    });
    return g;
  }, []);

  const doExport = async () => {
    setExporting(true);
    setExported(false);

    await new Promise(r => setTimeout(r, 800));

    const rows = dataToExport.map(lead => {
      const row = {};
      selectedFields.forEach(key => {
        const field = ALL_FIELDS.find(f => f.key === key);
        row[field.label] = lead[key] || '';
      });
      return row;
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `leads-export-${timestamp}`;

    try {
      if (format === 'csv') {
        const csv = Papa.unparse(rows);
        downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`);
      } else if (format === 'excel') {
        const ws = XLSX.utils.json_to_sheet(rows);
        const headerKeys = Object.keys(rows[0] || {});
        headerKeys.forEach((_, i) => {
          const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
          if (ws[cellRef]) {
            ws[cellRef].s = {
              font: { bold: true, color: { rgb: 'FFFFFF' } },
              fill: { fgColor: { rgb: '4F46E5' } },
              alignment: { horizontal: 'center' },
            };
          }
        });
        ws['!cols'] = headerKeys.map(() => ({ wch: 20 }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Leads');
        XLSX.writeFile(wb, `${filename}.xlsx`);
      }

      setExportInfo({ count: rows.length, format: FORMATS.find(f => f.value === format).label, filename: `${filename}.${format === 'excel' ? 'xlsx' : format}` });
      setExported(true);
    } catch (err) {
      console.error('Export failed:', err);
    }

    setExporting(false);
  };

  function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="ml-auto relative w-full max-w-5xl bg-white dark:bg-slate-900 h-full shadow-2xl animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-5 border-b border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Export Leads</h2>
              <p className="text-xs text-slate-500">Download your leads in CSV or Excel format</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in space-y-6">
            {/* Success notification */}
            {exported && exportInfo && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 animate-toast-in">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">Export Successful!</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    {exportInfo.count} leads exported as {exportInfo.format}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Scope & Format */}
              <div className="lg:col-span-1 space-y-6">
                {/* Scope */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-indigo-500" /> Export Scope
                  </h3>
                  <div className="space-y-3">
                    {SCOPES.map(s => (
                      <RadioCard
                        key={s.value}
                        selected={scope === s.value}
                        onClick={() => setScope(s.value)}
                        icon={s.icon}
                        label={s.label}
                        desc={s.desc}
                        disabled={s.value === 'selected' && (!selectedLeadIds || selectedLeadIds.length === 0)}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2 pl-1">
                    {scope === 'all' && `${leads?.length || 0} leads in total`}
                    {scope === 'selected' && `${selectedLeadIds?.length || 0} leads selected`}
                    {scope === 'filtered' && `${filteredLeads?.length || 0} filtered leads`}
                  </p>
                </div>

                {/* Format */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <File className="w-4 h-4 text-indigo-500" /> Export Format
                  </h3>
                  <div className="space-y-3">
                    {FORMATS.map(f => (
                      <RadioCard
                        key={f.value}
                        selected={format === f.value}
                        onClick={() => setFormat(f.value)}
                        icon={f.icon}
                        label={f.label}
                        desc={f.desc}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Field Selection */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-500" /> Select Fields ({selectedFields.length}/{ALL_FIELDS.length})
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={selectAll} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Select All</button>
                    <span className="text-slate-300">|</span>
                    <button onClick={deselectAll} className="text-xs text-slate-500 hover:underline">Deselect All</button>
                  </div>
                </div>

                <div className="glass-card !p-5 space-y-5">
                  {Object.entries(groups).map(([group, fields]) => (
                    <div key={group}>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">{group}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {fields.map(f => (
                          <button
                            key={f.key}
                            onClick={() => toggleField(f.key)}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 text-left ${
                              selectedFields.includes(f.key)
                                ? 'bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                                : 'bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {selectedFields.includes(f.key) ? (
                              <CheckSquare className="w-4 h-4 text-indigo-500 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Export button */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={doExport}
                loading={exporting}
                disabled={selectedFields.length === 0 || dataToExport.length === 0}
                size="lg"
              >
                {exporting ? (
                  <>Exporting...</>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export {dataToExport.length} Leads as {FORMATS.find(f => f.value === format)?.label}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
