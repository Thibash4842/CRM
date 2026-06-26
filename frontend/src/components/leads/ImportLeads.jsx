import { useState, useRef, useCallback, useEffect } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx-js-style';
import {
  Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle,
  ArrowRight, ArrowLeft, RotateCcw, Download, Loader2, Trash2,
  CloudUpload, FileWarning, Check, Zap, Copy, X
} from 'lucide-react';
import Button from '../ui/Button';
import { Select } from '../ui/Input';

const CRM_FIELDS = [
  { value: '', label: '— Skip this column —' },
  { value: 'firstName', label: 'First Name', required: true },
  { value: 'lastName', label: 'Last Name', required: true },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'company', label: 'Company' },
  { value: 'jobTitle', label: 'Job Title' },
  { value: 'source', label: 'Source' },
  { value: 'status', label: 'Status' },
  { value: 'notes', label: 'Notes' },
];

const VALID_SOURCES = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Trade Show', 'Email Campaign', 'Other'];
const VALID_STATUSES = ['NEW', 'CONTACTED', 'MEETING', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'FOLLOW_UP'];

function autoMapColumns(headers) {
  const mapping = {};
  const aliases = {
    firstname: 'firstName', first_name: 'firstName', 'first name': 'firstName',
    lastname: 'lastName', last_name: 'lastName', 'last name': 'lastName',
    email: 'email', 'email address': 'email', emailaddress: 'email',
    phone: 'phone', telephone: 'phone', mobile: 'phone', 'phone number': 'phone',
    company: 'company', organization: 'company', org: 'company', 'company name': 'company',
    jobtitle: 'jobTitle', job_title: 'jobTitle', 'job title': 'jobTitle', title: 'jobTitle', designation: 'jobTitle',
    source: 'source', 'lead source': 'source', leadsource: 'source',
    status: 'status', 'lead status': 'status', leadstatus: 'status',
    notes: 'notes', note: 'notes', description: 'notes', comments: 'notes',
  };
  headers.forEach((h, i) => {
    const key = h.toLowerCase().replace(/[^a-z0-9 _]/g, '').trim();
    if (aliases[key]) mapping[i] = aliases[key];
    else if (aliases[key.replace(/ /g, '')]) mapping[i] = aliases[key.replace(/ /g, '')];
    else mapping[i] = '';
  });
  return mapping;
}

function validateRow(row, existingEmails) {
  const errors = [];
  const warnings = [];
  if (!row.firstName?.trim()) errors.push('First Name is required');
  if (!row.lastName?.trim()) errors.push('Last Name is required');
  if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) errors.push('Invalid email format');
  if (row.phone && !/^[+\d\s()-]{7,20}$/.test(row.phone)) warnings.push('Phone format may be invalid');
  if (row.source && !VALID_SOURCES.includes(row.source)) warnings.push(`Unknown source "${row.source}"`);
  if (row.status && !VALID_STATUSES.includes(row.status.toUpperCase())) warnings.push(`Unknown status "${row.status}"`);
  const isDuplicate = row.email && existingEmails.has(row.email.toLowerCase().trim());
  if (isDuplicate) warnings.push('Duplicate: email already exists');
  return { errors, warnings, isDuplicate };
}

function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center w-full max-w-2xl mx-auto mb-8">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-initial">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`step-dot ${i < current ? 'completed' : i === current ? 'active' : 'pending'}`}>
              {i < current ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs font-medium whitespace-nowrap ${i <= current ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`step-connector ${i < current ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ImportLeads({ isOpen, onClose, leads, onImportComplete, createLead }) {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [columnMap, setColumnMap] = useState({});
  const [mappedData, setMappedData] = useState([]);
  const [validationResults, setValidationResults] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0, success: 0, failed: 0, skipped: 0 });
  const [importComplete, setImportComplete] = useState(false);
  const [importErrors, setImportErrors] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [parseError, setParseError] = useState('');
  const [cancelRef, setCancelRef] = useState(false);
  const fileInputRef = useRef(null);
  const cancelFlagRef = useRef(false);

  const existingEmails = new Set((leads || []).map(l => (l.email || '').toLowerCase().trim()).filter(Boolean));

  const parseFile = useCallback((f) => {
    setParseError('');
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      setParseError('Unsupported file type. Please upload a CSV or Excel file.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setParseError('File too large. Maximum size is 10 MB.');
      return;
    }
    setFile(f);

    if (ext === 'csv') {
      Papa.parse(f, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length < 2) {
            setParseError('File must contain a header row and at least one data row.');
            return;
          }
          const h = results.data[0].map(String);
          setHeaders(h);
          setRawData(results.data.slice(1));
          setColumnMap(autoMapColumns(h));
          setStep(1);
        },
        error: () => setParseError('Failed to parse CSV file.')
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target.result, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
          if (data.length < 2) {
            setParseError('File must contain a header row and at least one data row.');
            return;
          }
          const h = data[0].map(String);
          setHeaders(h);
          setRawData(data.slice(1));
          setColumnMap(autoMapColumns(h));
          setStep(1);
        } catch {
          setParseError('Failed to parse Excel file.');
        }
      };
      reader.readAsArrayBuffer(f);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) parseFile(f);
  }, [parseFile]);

  const handleMapChange = (colIdx, field) => {
    setColumnMap(prev => ({ ...prev, [colIdx]: field }));
  };

  const proceedToValidation = () => {
    const mapped = rawData.map(row => {
      const obj = {};
      Object.entries(columnMap).forEach(([idx, field]) => {
        if (field) obj[field] = String(row[parseInt(idx)] || '').trim();
      });
      return obj;
    });
    setMappedData(mapped);

    const results = mapped.map((row, i) => {
      const { errors, warnings, isDuplicate } = validateRow(row, existingEmails);
      return { index: i, row, errors, warnings, isDuplicate };
    });
    setValidationResults(results);
    setStep(2);
  };

  const startImport = async () => {
    const validRows = validationResults.filter(r => r.errors.length === 0 && !r.isDuplicate);
    setImporting(true);
    setImportProgress({ done: 0, total: validRows.length, success: 0, failed: 0, skipped: 0 });
    setImportErrors([]);
    cancelFlagRef.current = false;
    setStep(3);

    let success = 0, failed = 0;
    const errors = [];

    for (let i = 0; i < validRows.length; i++) {
      if (cancelFlagRef.current) break;
      try {
        const row = { ...validRows[i].row };
        if (!row.source) row.source = 'Website';
        if (!row.status) row.status = 'NEW';
        if (row.status) row.status = row.status.toUpperCase();
        await createLead(row);
        success++;
      } catch (err) {
        failed++;
        errors.push({ row: validRows[i].index + 1, error: err.message || 'Unknown error' });
      }
      setImportProgress({ done: i + 1, total: validRows.length, success, failed, skipped: 0 });
    }

    const skippedCount = validationResults.filter(r => r.errors.length > 0 || r.isDuplicate).length;
    setImportProgress(prev => ({ ...prev, done: prev.total, skipped: skippedCount }));
    setImportErrors(errors);
    setImportComplete(true);
    setImporting(false);
    setStep(4);
  };

  const downloadErrorReport = () => {
    const csv = Papa.unparse([
      ['Row', 'Error'],
      ...importErrors.map(e => [e.row, e.error]),
    ]);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import-errors-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setStep(0); setFile(null); setRawData([]); setHeaders([]); setColumnMap({});
    setMappedData([]); setValidationResults([]); setImporting(false);
    setImportProgress({ done: 0, total: 0, success: 0, failed: 0, skipped: 0 });
    setImportComplete(false); setImportErrors([]); setParseError('');
  };

  const stepNames = ['Upload', 'Map Columns', 'Validate', 'Importing', 'Summary'];
  const validCount = validationResults.filter(r => r.errors.length === 0 && !r.isDuplicate).length;
  const errorCount = validationResults.filter(r => r.errors.length > 0).length;
  const dupCount = validationResults.filter(r => r.isDuplicate).length;

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="ml-auto relative w-full max-w-5xl bg-white dark:bg-slate-900 h-full shadow-2xl animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-5 border-b border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Import Leads</h2>
              <p className="text-xs text-slate-500">Upload CSV or Excel files to bulk-import leads</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">
            <StepIndicator steps={stepNames} current={step} />

      {/* Step 0: Upload */}
      {step === 0 && (
        <div className="animate-slide-up">
          <div
            className={`drag-drop-zone ${dragging ? 'dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => { if (e.target.files[0]) parseFile(e.target.files[0]); }}
            />
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <CloudUpload className="w-10 h-10 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Drag & drop your file here
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Supports CSV, XLSX, XLS — Max 10 MB
                </p>
              </div>
              <Button variant="outline" size="md" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                <Upload className="w-4 h-4" /> Browse Files
              </Button>
            </div>
          </div>
          {parseError && (
            <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 animate-slide-up">
              <FileWarning className="w-5 h-5 shrink-0" />
              <p className="text-sm">{parseError}</p>
            </div>
          )}
        </div>
      )}

      {/* Step 1: Column Mapping */}
      {step === 1 && (
        <div className="animate-slide-up space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold">Map Columns to CRM Fields</h3>
              <p className="text-sm text-slate-500">
                <FileSpreadsheet className="w-4 h-4 inline mr-1" />
                {file?.name} — {rawData.length} rows detected
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setColumnMap(autoMapColumns(headers))}>
              <Zap className="w-4 h-4" /> Auto-detect
            </Button>
          </div>

          <div className="glass-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-400 w-1/3">File Column</th>
                    <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-400">→</th>
                    <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-400 w-1/3">CRM Field</th>
                    <th className="text-left p-4 font-semibold text-slate-600 dark:text-slate-400 w-1/4">Sample</th>
                  </tr>
                </thead>
                <tbody>
                  {headers.map((h, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-4">
                        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{h}</span>
                      </td>
                      <td className="p-4 text-slate-400">
                        <ArrowRight className="w-4 h-4" />
                      </td>
                      <td className="p-4">
                        <Select
                          options={CRM_FIELDS}
                          value={columnMap[i] || ''}
                          onChange={(e) => handleMapChange(i, e.target.value)}
                          className="!py-2 !text-sm"
                        />
                      </td>
                      <td className="p-4 text-xs text-slate-500 truncate max-w-[150px]">
                        {rawData[0]?.[i] || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="secondary" onClick={reset}>
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <Button onClick={proceedToValidation}>
              Validate Data <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Validation & Preview */}
      {step === 2 && (
        <div className="animate-slide-up space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card !p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{validCount}</p>
                <p className="text-xs text-slate-500">Ready to import</p>
              </div>
            </div>
            <div className="glass-card !p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                <p className="text-xs text-slate-500">Errors found</p>
              </div>
            </div>
            <div className="glass-card !p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Copy className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{dupCount}</p>
                <p className="text-xs text-slate-500">Duplicates</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-0 overflow-hidden">
            <div className="overflow-x-auto max-h-[340px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left p-3 font-semibold text-slate-600 dark:text-slate-400 w-12">#</th>
                    <th className="text-left p-3 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                    {Object.values(columnMap).filter(Boolean).map((field, i) => (
                      <th key={i} className="text-left p-3 font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {CRM_FIELDS.find(f => f.value === field)?.label || field}
                      </th>
                    ))}
                    <th className="text-left p-3 font-semibold text-slate-600 dark:text-slate-400">Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {validationResults.slice(0, 50).map((r) => (
                    <tr key={r.index} className={`border-b border-slate-100 dark:border-slate-800 last:border-0 ${r.errors.length > 0 ? 'bg-red-50/50 dark:bg-red-950/10' : r.isDuplicate ? 'bg-amber-50/50 dark:bg-amber-950/10' : ''}`}>
                      <td className="p-3 text-slate-500">{r.index + 1}</td>
                      <td className="p-3">
                        {r.errors.length > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            <XCircle className="w-3 h-3" /> Error
                          </span>
                        ) : r.isDuplicate ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            <Copy className="w-3 h-3" /> Duplicate
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Valid
                          </span>
                        )}
                      </td>
                      {Object.values(columnMap).filter(Boolean).map((field, i) => (
                        <td key={i} className="p-3 truncate max-w-[150px]">{r.row[field] || '—'}</td>
                      ))}
                      <td className="p-3 text-xs text-red-600 dark:text-red-400 max-w-[200px]">
                        {[...r.errors, ...r.warnings].join('; ') || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {validationResults.length > 50 && (
              <div className="text-center text-xs text-slate-500 py-2 border-t border-slate-100 dark:border-slate-800">
                Showing first 50 of {validationResults.length} rows
              </div>
            )}
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="secondary" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <Button onClick={startImport} disabled={validCount === 0}>
              <Zap className="w-4 h-4" /> Start Import ({validCount} leads)
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Import Progress */}
      {step === 3 && !importComplete && (
        <div className="animate-slide-up flex flex-col items-center gap-6 py-8">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold">Importing Leads...</h3>
            <p className="text-sm text-slate-500 mt-1">
              {importProgress.done} of {importProgress.total} rows processed
            </p>
          </div>

          <div className="w-full max-w-md">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full gradient-primary ops-progress-bar rounded-full transition-all duration-300"
                style={{ width: `${importProgress.total > 0 ? (importProgress.done / importProgress.total * 100) : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span className="text-emerald-600">✓ {importProgress.success} imported</span>
              <span className="text-red-600">✗ {importProgress.failed} failed</span>
            </div>
          </div>

          <Button variant="danger" size="sm" onClick={() => { cancelFlagRef.current = true; }}>
            Cancel Import
          </Button>
        </div>
      )}

      {/* Step 4: Summary */}
      {step === 4 && (
        <div className="animate-slide-up flex flex-col items-center gap-6 py-6">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${importProgress.failed === 0 ? 'bg-emerald-500 shadow-emerald-500/25' : 'bg-amber-500 shadow-amber-500/25'}`}>
            {importProgress.failed === 0 ? <CheckCircle2 className="w-10 h-10 text-white" /> : <AlertTriangle className="w-10 h-10 text-white" />}
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold">
              {importProgress.failed === 0 ? 'Import Complete!' : 'Import Finished with Issues'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">Here's a summary of the import results</p>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
            <div className="glass-card !p-4 text-center">
              <p className="text-3xl font-bold text-emerald-600">{importProgress.success}</p>
              <p className="text-xs text-slate-500 mt-1">Imported</p>
            </div>
            <div className="glass-card !p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{importProgress.failed}</p>
              <p className="text-xs text-slate-500 mt-1">Failed</p>
            </div>
            <div className="glass-card !p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">{importProgress.skipped}</p>
              <p className="text-xs text-slate-500 mt-1">Skipped</p>
            </div>
          </div>

          <div className="flex gap-3">
            {importErrors.length > 0 && (
              <Button variant="outline" onClick={downloadErrorReport}>
                <Download className="w-4 h-4" /> Download Error Report
              </Button>
            )}
            <Button variant="secondary" onClick={reset}>
              <RotateCcw className="w-4 h-4" /> Import More
            </Button>
            <Button onClick={() => { onImportComplete(); }}>
              <CheckCircle2 className="w-4 h-4" /> Done
            </Button>
          </div>
        </div>
      )}
          </div>
        </div>
      </div>
    </div>
  );
}
