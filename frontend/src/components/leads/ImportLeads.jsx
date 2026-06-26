import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx-js-style';
import {
  Upload, CloudUpload, FileSpreadsheet, FileWarning,
  Check, CheckCircle2, CheckCircle, AlertTriangle, XCircle,
  ArrowRight, ArrowLeft, RotateCcw, Download, Loader2,
  Zap, Copy, X, Settings, Users, Tag, Globe, User,
  FileText, Clock, Shield, Bell, Activity, BarChart2,
  Eye, RefreshCw, Plus, Info, ChevronRight, Sparkles,
  Play, Database,
} from 'lucide-react';

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const STEP_NAMES = ['Upload', 'Map Columns', 'Options', 'Validate', 'Import', 'Summary'];

const CRM_FIELDS = [
  { value: '', label: '— Skip / Ignore Column —' },
  { value: 'firstName', label: 'First Name', required: true },
  { value: 'lastName', label: 'Last Name', required: true },
  { value: 'email', label: 'Email Address' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'company', label: 'Company Name' },
  { value: 'jobTitle', label: 'Job Title' },
  { value: 'source', label: 'Lead Source' },
  { value: 'status', label: 'Lead Status' },
  { value: 'priority', label: 'Priority' },
  { value: 'notes', label: 'Notes / Comments' },
];

const VALID_SOURCES = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Trade Show', 'Email Campaign', 'Facebook', 'Google Ads', 'Campaign', 'Other'];
const VALID_STATUSES = ['NEW', 'CONTACTED', 'MEETING', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'FOLLOW_UP'];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function autoMapColumns(headers) {
  const mapping = {};
  const aliases = {
    firstname: 'firstName', first_name: 'firstName', 'first name': 'firstName',
    name: 'firstName', 'lead name': 'firstName', fullname: 'firstName', 'full name': 'firstName',
    lastname: 'lastName', last_name: 'lastName', 'last name': 'lastName', surname: 'lastName',
    email: 'email', 'email address': 'email', emailaddress: 'email', mail: 'email',
    phone: 'phone', telephone: 'phone', mobile: 'phone', 'phone number': 'phone', cell: 'phone',
    company: 'company', organization: 'company', org: 'company', 'company name': 'company', 'account name': 'company',
    jobtitle: 'jobTitle', job_title: 'jobTitle', 'job title': 'jobTitle', title: 'jobTitle', designation: 'jobTitle', position: 'jobTitle',
    source: 'source', 'lead source': 'source', leadsource: 'source',
    status: 'status', 'lead status': 'status', leadstatus: 'status', stage: 'status',
    priority: 'priority', importance: 'priority',
    notes: 'notes', note: 'notes', description: 'notes', comments: 'notes', remarks: 'notes',
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
  if (!row.firstName?.trim() && !row.lastName?.trim()) errors.push('Name is required');
  if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) errors.push('Invalid email format');
  if (row.phone && !/^[+\d\s()-]{7,20}$/.test(row.phone)) warnings.push('Phone format may be invalid');
  if (row.source && !VALID_SOURCES.includes(row.source)) warnings.push(`Unknown source "${row.source}"`);
  if (row.status && !VALID_STATUSES.includes(row.status?.toUpperCase())) warnings.push(`Unknown status "${row.status}"`);
  const isDuplicate = !!(row.email && existingEmails.has(row.email.toLowerCase().trim()));
  if (isDuplicate) warnings.push('Duplicate: email already exists in CRM');
  return { errors, warnings, isDuplicate };
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function formatTime(d) {
  if (!d) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '16px 24px 0', overflowX: 'auto' }}>
      {STEP_NAMES.map((name, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEP_NAMES.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, minWidth: 68 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: done ? '#10b981' : active ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#e2e8f0',
                color: done || active ? 'white' : '#94a3b8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800,
                boxShadow: active ? '0 0 0 4px rgba(99,102,241,0.18),0 4px 14px rgba(99,102,241,0.35)' : done ? '0 0 0 3px rgba(16,185,129,0.15)' : 'none',
                transition: 'all 0.35s ease',
              }}>
                {done ? <Check size={15} /> : i + 1}
              </div>
              <span style={{
                fontSize: 10.5, fontWeight: active ? 800 : done ? 700 : 500,
                color: done ? '#10b981' : active ? '#6366f1' : '#94a3b8',
                whiteSpace: 'nowrap', letterSpacing: '0.01em',
              }}>{name}</span>
            </div>
            {i < STEP_NAMES.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '0 6px', marginBottom: 18,
                background: done ? 'linear-gradient(90deg,#10b981,#34d399)' : '#e2e8f0',
                borderRadius: 99, transition: 'background 0.35s ease',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SectionCard({ title, icon: Icon, iconColor = '#6366f1', iconBg = '#f5f3ff', children }) {
  return (
    <div style={{
      background: 'white', borderRadius: 14, border: '1.5px solid #f0f4ff',
      boxShadow: '0 1px 6px rgba(0,0,0,0.05)', overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
        background: 'linear-gradient(135deg,#fafbff,#f5f7ff)',
      }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} color={iconColor} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', letterSpacing: '0.01em' }}>{title}</span>
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  );
}

function RadioOption({ value, selected, onChange, label, desc, children }) {
  return (
    <label
      onClick={() => onChange(value)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
        border: `1.5px solid ${selected ? '#6366f1' : '#e5e7eb'}`,
        background: selected ? '#f5f3ff' : 'white',
        marginBottom: 8, transition: 'all 0.15s ease',
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
        border: `2px solid ${selected ? '#6366f1' : '#d1d5db'}`,
        background: selected ? '#6366f1' : 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s ease',
      }}>
        {selected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1e293b' }}>{label}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, lineHeight: 1.5 }}>{desc}</div>
        {selected && children && <div style={{ marginTop: 10 }}>{children}</div>}
      </div>
    </label>
  );
}

function CheckboxItem({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>
      <div
        onClick={onChange}
        style={{
          width: 18, height: 18, borderRadius: 5, flexShrink: 0,
          border: `2px solid ${checked ? '#6366f1' : '#d1d5db'}`,
          background: checked ? '#6366f1' : 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.15s ease',
        }}
      >
        {checked && <Check size={11} color="white" strokeWidth={3} />}
      </div>
      <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{label}</span>
    </label>
  );
}

function TagInput({ tags, onChange }) {
  const [val, setVal] = useState('');
  const handleKey = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && val.trim()) {
      e.preventDefault();
      if (!tags.includes(val.trim())) onChange([...tags, val.trim()]);
      setVal('');
    } else if (e.key === 'Backspace' && !val && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };
  return (
    <div
      style={{
        display: 'flex', flexWrap: 'wrap', gap: 6, padding: '7px 10px',
        border: '1.5px solid #e2e8f0', borderRadius: 9, minHeight: 42,
        background: 'white', cursor: 'text', alignItems: 'center',
      }}
      onClick={e => e.currentTarget.querySelector('input')?.focus()}
    >
      {tags.map(t => (
        <span key={t} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: 'linear-gradient(135deg,#ede9fe,#e0e7ff)',
          color: '#6366f1', fontSize: 12, fontWeight: 700,
          padding: '3px 8px 3px 10px', borderRadius: 20,
        }}>
          {t}
          <button onClick={(e) => { e.stopPropagation(); onChange(tags.filter(x => x !== t)); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', padding: 0, display: 'flex', alignItems: 'center', lineHeight: 1 }}>
            <X size={10} strokeWidth={3} />
          </button>
        </span>
      ))}
      <input
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={handleKey}
        placeholder={tags.length === 0 ? 'Type and press Enter to add tags...' : ''}
        style={{ border: 'none', outline: 'none', fontSize: 13, flex: 1, minWidth: 120, background: 'transparent', color: '#374151' }}
      />
    </div>
  );
}

function AnimatedCounter({ target, duration = 900 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{count.toLocaleString()}</span>;
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function ImportLeads({ isOpen, onClose, leads, onImportComplete, createLead }) {
  // Core state
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [columnMap, setColumnMap] = useState({});
  const [mappedData, setMappedData] = useState([]);
  const [validationResults, setValidationResults] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [parseError, setParseError] = useState('');
  const fileInputRef = useRef(null);

  // Import state
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0, success: 0, failed: 0, skipped: 0 });
  const [importErrors, setImportErrors] = useState([]);
  const [importStartTime, setImportStartTime] = useState(null);
  const [importEndTime, setImportEndTime] = useState(null);
  const [statusMsg, setStatusMsg] = useState('Creating Leads...');
  const cancelFlagRef = useRef(false);

  // Template state
  const [savedTemplates, setSavedTemplates] = useState(() => {
    try { return JSON.parse(localStorage.getItem('crm_import_templates_v2') || '{}'); } catch { return {}; }
  });
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  // Processing Options
  const [recordMode, setRecordMode] = useState('create');
  const [matchField, setMatchField] = useState('email');
  const [duplicateMode, setDuplicateMode] = useState('skip');
  const [ownerMode, setOwnerMode] = useState('file');
  const [selectedOwner, setSelectedOwner] = useState('');
  const [automation, setAutomation] = useState({ workflows: true, assignments: true, approvals: false, notifications: true, activity: true });
  const [tags, setTags] = useState([]);
  const [defaultSource, setDefaultSource] = useState('');

  const existingEmails = useMemo(() =>
    new Set((leads || []).map(l => (l.email || '').toLowerCase().trim()).filter(Boolean)),
    [leads]);

  // ── Parse File ──────────────────────────────
  const parseFile = useCallback((f) => {
    setParseError('');
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) { setParseError('Unsupported file type. Please upload CSV, XLS, or XLSX.'); return; }
    if (f.size > 10 * 1024 * 1024) { setParseError('File too large. Maximum size is 10 MB.'); return; }
    setFile(f);
    if (ext === 'csv') {
      Papa.parse(f, {
        header: false, skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length < 2) { setParseError('File must contain a header row and at least one data row.'); return; }
          const h = results.data[0].map(String);
          setHeaders(h); setRawData(results.data.slice(1)); setColumnMap(autoMapColumns(h)); setStep(1);
        },
        error: () => setParseError('Failed to parse CSV file.'),
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target.result, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
          if (data.length < 2) { setParseError('File must contain a header row and at least one data row.'); return; }
          const h = data[0].map(String);
          setHeaders(h); setRawData(data.slice(1)); setColumnMap(autoMapColumns(h)); setStep(1);
        } catch { setParseError('Failed to parse Excel file.'); }
      };
      reader.readAsArrayBuffer(f);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) parseFile(f);
  }, [parseFile]);

  // ── Mapping ──────────────────────────────────
  const mappedCount = useMemo(() => Object.values(columnMap).filter(Boolean).length, [columnMap]);
  const mappingPct = headers.length > 0 ? Math.round((mappedCount / headers.length) * 100) : 0;
  const requiredFields = CRM_FIELDS.filter(f => f.required).map(f => f.value);
  const mappedValues = Object.values(columnMap).filter(Boolean);
  const missingRequired = requiredFields.filter(f => !mappedValues.includes(f));

  const saveTemplate = () => {
    if (!templateName.trim()) return;
    const updated = { ...savedTemplates, [templateName.trim()]: columnMap };
    setSavedTemplates(updated);
    localStorage.setItem('crm_import_templates_v2', JSON.stringify(updated));
    setShowSaveTemplate(false);
    setTemplateName('');
  };

  const downloadSampleTemplate = () => {
    const csv = Papa.unparse([
      ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Source', 'Status', 'Priority', 'Notes'],
      ['John', 'Doe', 'john@example.com', '+91 9876543210', 'Acme Corp', 'Website', 'NEW', 'HOT', 'Interested in enterprise plan'],
      ['Jane', 'Smith', 'jane@corp.com', '+91 8765432109', 'TechStart Ltd', 'LinkedIn', 'CONTACTED', 'WARM', 'Follow up next week'],
    ]);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'crm-import-template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Validate ─────────────────────────────────
  const proceedToValidation = () => {
    const mapped = rawData.map(row => {
      const obj = {};
      Object.entries(columnMap).forEach(([idx, field]) => {
        if (field) obj[field] = String(row[parseInt(idx)] || '').trim();
      });
      if (defaultSource && !obj.source) obj.source = defaultSource;
      return obj;
    });
    setMappedData(mapped);
    const results = mapped.map((row, i) => {
      const { errors, warnings, isDuplicate } = validateRow(row, existingEmails);
      return { index: i, row, errors, warnings, isDuplicate };
    });
    setValidationResults(results);
    setStep(3);
  };

  // ── Import ───────────────────────────────────
  const startImport = async () => {
    let validRows;
    if (duplicateMode === 'skip') validRows = validationResults.filter(r => r.errors.length === 0 && !r.isDuplicate);
    else validRows = validationResults.filter(r => r.errors.length === 0);

    setImporting(true);
    cancelFlagRef.current = false;
    setImportProgress({ done: 0, total: validRows.length, success: 0, failed: 0, skipped: 0 });
    setImportErrors([]);
    setImportStartTime(new Date());
    setStep(4);

    let success = 0, failed = 0;
    const errors = [];
    const msgs = ['Creating Leads...', 'Processing Records...', 'Validating Data...', 'Saving to CRM...', 'Almost done...'];
    let mi = 0;
    const msgTimer = setInterval(() => { mi = (mi + 1) % msgs.length; setStatusMsg(msgs[mi]); }, 1800);

    for (let i = 0; i < validRows.length; i++) {
      if (cancelFlagRef.current) break;
      try {
        const row = { ...validRows[i].row };
        if (!row.source) row.source = defaultSource || 'Website';
        if (!row.status) row.status = 'NEW';
        if (row.status) row.status = row.status.toUpperCase();
        if (tags.length > 0) row.tags = tags.join(',');
        await createLead(row);
        success++;
      } catch (err) {
        failed++;
        errors.push({ row: validRows[i].index + 1, error: err.message || 'Unknown error' });
      }
      setImportProgress({ done: i + 1, total: validRows.length, success, failed, skipped: 0 });
    }

    clearInterval(msgTimer);
    const skippedCount = validationResults.filter(r => r.errors.length > 0 || (duplicateMode === 'skip' && r.isDuplicate)).length;
    setImportProgress(prev => ({ ...prev, skipped: skippedCount }));
    setImportErrors(errors);
    setImporting(false);
    setImportEndTime(new Date());
    setStep(5);
  };

  // ── Downloads ────────────────────────────────
  const downloadValidationReport = () => {
    const rows = validationResults.map(r => ({
      Row: r.index + 1,
      Status: r.errors.length > 0 ? 'Error' : r.isDuplicate ? 'Duplicate' : r.warnings.length > 0 ? 'Warning' : 'Valid',
      Name: `${r.row.firstName || ''} ${r.row.lastName || ''}`.trim(),
      Email: r.row.email || '',
      Company: r.row.company || '',
      Issues: [...r.errors, ...r.warnings].join('; ') || 'None',
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `validation-report-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadErrorReport = () => {
    const csv = Papa.unparse([['Row', 'Error'], ...importErrors.map(e => [e.row, e.error])]);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `import-errors-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Reset ────────────────────────────────────
  const reset = () => {
    setStep(0); setFile(null); setRawData([]); setHeaders([]); setColumnMap({});
    setMappedData([]); setValidationResults([]); setImporting(false);
    setImportProgress({ done: 0, total: 0, success: 0, failed: 0, skipped: 0 });
    setImportErrors([]); setParseError('');
    setImportStartTime(null); setImportEndTime(null);
    setTags([]); setDefaultSource(''); setRecordMode('create');
    setDuplicateMode('skip'); setOwnerMode('file');
  };
  const handleClose = () => { reset(); onClose(); };

  // ── Derived stats ─────────────────────────────
  const validCount = validationResults.filter(r => r.errors.length === 0 && !r.isDuplicate).length;
  const errorCount = validationResults.filter(r => r.errors.length > 0).length;
  const warnCount = validationResults.filter(r => r.errors.length === 0 && r.warnings.length > 0 && !r.isDuplicate).length;
  const dupCount = validationResults.filter(r => r.isDuplicate).length;
  const progressPct = importProgress.total > 0 ? Math.round((importProgress.done / importProgress.total) * 100) : 0;

  const getDuration = () => {
    if (!importStartTime || !importEndTime) return '—';
    const s = Math.round((importEndTime - importStartTime) / 1000);
    return s < 60 ? `${s} seconds` : `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  if (!isOpen) return null;

  // ── Shared style tokens ───────────────────────
  const S = {
    btn: (variant = 'primary') => ({
      display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 22px',
      borderRadius: 9, fontWeight: 700, fontSize: 13.5, cursor: 'pointer', transition: 'all 0.18s ease',
      border: variant === 'primary' ? 'none'
        : variant === 'success' ? 'none'
          : variant === 'danger' ? '1.5px solid #fecaca'
            : '1.5px solid #e2e8f0',
      background: variant === 'primary' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
        : variant === 'success' ? 'linear-gradient(135deg,#10b981,#059669)'
          : variant === 'danger' ? '#fef2f2'
            : 'white',
      color: variant === 'primary' ? 'white'
        : variant === 'success' ? 'white'
          : variant === 'danger' ? '#dc2626'
            : '#374151',
      boxShadow: variant === 'primary' ? '0 4px 14px rgba(99,102,241,0.3)'
        : variant === 'success' ? '0 4px 14px rgba(16,185,129,0.3)'
          : 'none',
    }),
    card: {
      background: 'white', borderRadius: 14,
      border: '1.5px solid #f0f4ff',
      boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
    },
  };

  // ── RENDER ───────────────────────────────────
  return (
    <>
      {/* Inject keyframes */}
      <style>{`
        @keyframes importSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes importPulse { 0%,100% { transform: scale(1); opacity:1; } 50% { transform: scale(1.04); opacity:0.85; } }
        @keyframes importFadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes successBounce { 0% { transform:scale(0.4); opacity:0; } 70% { transform:scale(1.1); } 100% { transform:scale(1); opacity:1; } }
        @keyframes stripedMove { 0% { background-position: 40px 0; } 100% { background-position: 0 0; } }
        .import-wizard-step { animation: importFadeUp 0.32s ease forwards; }
        .import-wizard-spin { animation: importSpin 1s linear infinite; }
        .import-wizard-pulse { animation: importPulse 2.4s ease infinite; }
        .import-wizard-success { animation: successBounce 0.55s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
        .import-striped-bar {
          background-image: linear-gradient(45deg,rgba(255,255,255,.18) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.18) 50%,rgba(255,255,255,.18) 75%,transparent 75%,transparent);
          background-size: 40px 40px;
          animation: stripedMove 1.2s linear infinite;
        }
        .iw-row:hover { background: #fafbff !important; }
        .iw-back-btn:hover { background: #f8fafc !important; border-color: #c7d2fe !important; }
        .iw-btn-ghost:hover { background: #f5f3ff !important; }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex' }}>
        {/* Backdrop */}
        <div
          style={{ position: 'absolute', inset: 0, background: 'rgba(2,6,23,0.58)', backdropFilter: 'blur(6px)' }}
          onClick={step === 4 ? undefined : handleClose}
        />

        {/* Wizard Panel */}
        <div className="animate-slide-in-right" style={{
          marginLeft: 'auto', position: 'relative',
          width: '100%', maxWidth: 960,
          background: '#f6f7fb', height: '100%',
          boxShadow: '-12px 0 60px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column',
        }}>

          {/* ── Header ── */}
          <div style={{
            background: 'white', flexShrink: 0,
            borderBottom: '1px solid #e8ecf4',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 6px 18px rgba(99,102,241,0.38)',
                }}>
                  <Database size={20} color="white" />
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
                    Import Leads
                  </h2>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0', fontWeight: 500 }}>
                    Bulk import lead records — Step {step + 1} of {STEP_NAMES.length}: <strong>{STEP_NAMES[step]}</strong>
                  </p>
                </div>
              </div>
              {step !== 4 && (
                <button onClick={handleClose} style={{
                  width: 34, height: 34, borderRadius: 9, border: '1.5px solid #e2e8f0',
                  background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <X size={16} color="#64748b" />
                </button>
              )}
            </div>
            <StepIndicator current={step} />
            {/* Step mini-progress bar */}
            <div style={{ height: 3, background: '#f1f5f9', marginTop: 16 }}>
              <div style={{
                height: '100%',
                width: `${((step + 1) / STEP_NAMES.length) * 100}%`,
                background: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>

          {/* ── Content ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

            {/* ══════════════════════════════════════
                STEP 0 — UPLOAD FILE
            ══════════════════════════════════════ */}
            {step === 0 && (
              <div className="import-wizard-step" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Drop Zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2.5px dashed ${dragging ? '#6366f1' : '#c7d2fe'}`,
                    borderRadius: 18, padding: '60px 32px',
                    background: dragging ? 'linear-gradient(135deg,#f5f3ff,#eef2ff)' : 'white',
                    textAlign: 'center', cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: dragging ? '0 0 0 5px rgba(99,102,241,0.12),inset 0 0 40px rgba(99,102,241,0.04)' : '0 1px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls"
                    style={{ display: 'none' }}
                    onChange={e => { if (e.target.files[0]) parseFile(e.target.files[0]); }} />

                  <div style={{
                    width: 80, height: 80, borderRadius: 22, margin: '0 auto 22px',
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 12px 36px rgba(99,102,241,0.38)',
                  }} className={dragging ? 'import-wizard-pulse' : ''}>
                    <CloudUpload size={38} color="white" />
                  </div>

                  <h3 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', marginBottom: 8, letterSpacing: '-0.02em' }}>
                    {dragging ? 'Release to Upload' : 'Drag & Drop your file here'}
                  </h3>
                  <p style={{ fontSize: 14, color: '#64748b', marginBottom: 22 }}>
                    Supports CSV, XLS, and XLSX formats
                  </p>
                  <button
                    onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    style={{ ...S.btn(), padding: '10px 28px', fontSize: 14 }}
                  >
                    <Upload size={16} /> Browse Files
                  </button>
                </div>

                {/* Parse Error */}
                {parseError && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
                    borderRadius: 12, background: '#fef2f2', border: '1.5px solid #fecaca',
                  }}>
                    <FileWarning size={20} color="#dc2626" />
                    <span style={{ fontSize: 14, color: '#dc2626', fontWeight: 600 }}>{parseError}</span>
                  </div>
                )}

                {/* Info Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                  {[
                    { icon: <FileSpreadsheet size={18} color="#6366f1" />, bg: '#f5f3ff', label: 'Supported Formats', value: 'CSV, XLS, XLSX' },
                    { icon: <Shield size={18} color="#10b981" />, bg: '#f0fdf4', label: 'Max File Size', value: '10 MB' },
                    { icon: <BarChart2 size={18} color="#f59e0b" />, bg: '#fffbeb', label: 'Max Rows', value: '50,000 rows' },
                  ].map((item, i) => (
                    <div key={i} style={{ ...S.card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</div>
                      <div>
                        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', marginTop: 2 }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Download Template */}
                <div style={{ ...S.card, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Download size={17} color="#10b981" />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Need a sample file?</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Download our template CSV with the correct column headers</div>
                    </div>
                  </div>
                  <button onClick={downloadSampleTemplate} style={{
                    padding: '8px 18px', borderRadius: 9, border: '1.5px solid #a7f3d0',
                    background: '#f0fdf4', color: '#059669', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}>
                    <Download size={14} /> Download Template
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════
                STEP 1 — MAP COLUMNS
            ══════════════════════════════════════ */}
            {step === 1 && (
              <div className="import-wizard-step" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* File info + actions */}
                <div style={{ ...S.card, padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <FileSpreadsheet size={18} color="#6366f1" />
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#1e293b' }}>Map Columns to CRM Fields</span>
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b', marginLeft: 28 }}>
                        <strong style={{ color: '#374151' }}>{file?.name}</strong>
                        &nbsp;·&nbsp;{rawData.length.toLocaleString()} rows
                        &nbsp;·&nbsp;{formatBytes(file?.size || 0)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {Object.keys(savedTemplates).length > 0 && (
                        <select
                          onChange={e => { if (e.target.value) { setColumnMap(savedTemplates[e.target.value]); } e.target.value = ''; }}
                          style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 12, cursor: 'pointer', background: 'white', color: '#374151', fontWeight: 600 }}
                        >
                          <option value="">Load Template...</option>
                          {Object.keys(savedTemplates).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      )}
                      <button onClick={() => setColumnMap(autoMapColumns(headers))} style={{
                        padding: '6px 14px', borderRadius: 8, border: '1.5px solid #6366f1',
                        background: '#f5f3ff', color: '#6366f1', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 5,
                      }} className="iw-btn-ghost">
                        <Zap size={13} /> Auto-Detect
                      </button>
                      <button onClick={() => setShowSaveTemplate(!showSaveTemplate)} style={{
                        padding: '6px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0',
                        background: 'white', color: '#374151', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 5,
                      }}>
                        <FileText size={13} /> Save Template
                      </button>
                    </div>
                  </div>

                  {showSaveTemplate && (
                    <div style={{ marginTop: 12, padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1.5px solid #e2e8f0', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        value={templateName} onChange={e => setTemplateName(e.target.value)}
                        placeholder="Enter template name..."
                        style={{ flex: 1, padding: '7px 12px', borderRadius: 8, border: '1.5px solid #6366f1', fontSize: 13, outline: 'none', background: 'white' }}
                        onKeyDown={e => e.key === 'Enter' && saveTemplate()}
                      />
                      <button onClick={saveTemplate} style={{ ...S.btn(), padding: '7px 16px', fontSize: 13 }}>Save</button>
                      <button onClick={() => setShowSaveTemplate(false)} style={{ padding: '7px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: 'white', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  )}
                </div>

                {/* Mapping Progress */}
                <div style={{ ...S.card, padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
                      Mapping Completion
                    </span>
                    <div style={{ display: 'flex', align: 'center', gap: 8 }}>
                      <span style={{ fontSize: 22, fontWeight: 900, color: mappingPct === 100 ? '#10b981' : '#6366f1' }}>{mappingPct}%</span>
                      <span style={{ fontSize: 12, color: '#94a3b8', alignSelf: 'center' }}>{mappedCount} / {headers.length} fields</span>
                    </div>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 99,
                      width: `${mappingPct}%`,
                      background: mappingPct === 100 ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#6366f1,#8b5cf6)',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                  {missingRequired.length > 0 && (
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a' }}>
                      <AlertTriangle size={14} color="#d97706" />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>
                        Required fields not mapped: {missingRequired.map(f => CRM_FIELDS.find(c => c.value === f)?.label).join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Mapping Table */}
                <div style={{ background: 'white', borderRadius: 14, border: '1.5px solid #e8ecf4', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg,#f8fafc,#f1f5ff)', borderBottom: '1.5px solid #e8ecf4' }}>
                        {['#', 'File Column', 'Sample Data', '', 'Map to CRM Field', 'Status'].map((h, i) => (
                          <th key={i} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {headers.map((h, i) => {
                        const mapped = columnMap[i];
                        const fieldDef = CRM_FIELDS.find(f => f.value === mapped);
                        return (
                          <tr key={i} className="iw-row" style={{ borderBottom: '1px solid #f1f5f9', background: 'white', transition: 'background 0.12s' }}>
                            <td style={{ padding: '10px 14px', fontSize: 12, color: '#94a3b8', fontWeight: 700, width: 36 }}>{i + 1}</td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f1f5f9', padding: '3px 9px', borderRadius: 6, color: '#374151', fontWeight: 700 }}>{h}</span>
                            </td>
                            <td style={{ padding: '10px 14px', maxWidth: 120 }}>
                              <span style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                {rawData[0]?.[i] ? String(rawData[0][i]).slice(0, 30) : <span style={{ color: '#d1d5db', fontStyle: 'italic' }}>empty</span>}
                              </span>
                            </td>
                            <td style={{ padding: '10px 8px', color: '#c7d2fe' }}>
                              <ChevronRight size={15} />
                            </td>
                            <td style={{ padding: '10px 14px', minWidth: 200 }}>
                              <select
                                value={columnMap[i] || ''}
                                onChange={e => setColumnMap(prev => ({ ...prev, [i]: e.target.value }))}
                                style={{
                                  width: '100%', padding: '7px 10px', borderRadius: 9,
                                  border: `1.5px solid ${columnMap[i] ? '#6366f1' : '#e2e8f0'}`,
                                  background: columnMap[i] ? '#f5f3ff' : 'white',
                                  fontSize: 13, color: columnMap[i] ? '#6366f1' : '#374151',
                                  fontWeight: columnMap[i] ? 700 : 500, outline: 'none', cursor: 'pointer',
                                }}
                              >
                                {CRM_FIELDS.map(f => (
                                  <option key={f.value} value={f.value}>
                                    {f.label}{f.required ? ' ★' : ''}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              {columnMap[i] ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: fieldDef?.required ? '#7c3aed' : '#059669', background: fieldDef?.required ? '#f5f3ff' : '#d1fae5', padding: '3px 10px', borderRadius: 20 }}>
                                  <Check size={10} strokeWidth={3} /> {fieldDef?.required ? 'Required ★' : 'Mapped'}
                                </span>
                              ) : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#94a3b8', background: '#f8fafc', padding: '3px 10px', borderRadius: 20 }}>
                                  Ignored
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════
                STEP 2 — PROCESSING OPTIONS
            ══════════════════════════════════════ */}
            {step === 2 && (
              <div className="import-wizard-step" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* S1: Record Processing */}
                <SectionCard title="Record Processing" icon={Database} iconColor="#6366f1" iconBg="#f5f3ff">
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>
                    How should the records in this file be processed?
                  </p>
                  <RadioOption value="create" selected={recordMode === 'create'} onChange={setRecordMode}
                    label="Create New Records Only"
                    desc="Import all records as new leads. Existing records will not be affected." />
                  <RadioOption value="update" selected={recordMode === 'update'} onChange={setRecordMode}
                    label="Update Existing Records"
                    desc="Update existing records by matching a unique field.">
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Match Existing Records Using</label>
                      <select value={matchField} onChange={e => setMatchField(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: 9, border: '1.5px solid #6366f1', fontSize: 13, background: 'white', color: '#374151', minWidth: 220, outline: 'none' }}>
                        {[['email', 'Email'], ['phone', 'Phone'], ['lead_id', 'Lead ID'], ['external_id', 'External ID'], ['custom', 'Custom Unique Field']].map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </RadioOption>
                  <RadioOption value="both" selected={recordMode === 'both'} onChange={setRecordMode}
                    label="Create New & Update Existing"
                    desc="If a matching record exists, update it. Otherwise create a new record." />
                </SectionCard>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {/* S2: Duplicate Handling */}
                  <SectionCard title="Duplicate Handling" icon={Copy} iconColor="#8b5cf6" iconBg="#f5f3ff">
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>If duplicate records are found</p>
                    <RadioOption value="skip" selected={duplicateMode === 'skip'} onChange={setDuplicateMode}
                      label="Skip Duplicate Records"
                      desc="Duplicates will be skipped. No new leads created for existing records." />
                    <RadioOption value="update" selected={duplicateMode === 'update'} onChange={setDuplicateMode}
                      label="Update Duplicate Records"
                      desc="Duplicate records will be updated with the new data from the file." />
                    <RadioOption value="allow" selected={duplicateMode === 'allow'} onChange={setDuplicateMode}
                      label="Allow Duplicate Records"
                      desc="Create new records even if duplicates exist. Not recommended." />
                  </SectionCard>

                  {/* S3: Assign Owner */}
                  <SectionCard title="Assign Owner" icon={Users} iconColor="#10b981" iconBg="#f0fdf4">
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>Assign imported records to</p>
                    <RadioOption value="file" selected={ownerMode === 'file'} onChange={setOwnerMode}
                      label="Keep Owner from Imported File"
                      desc="Uses the Owner column if it exists in the file." />
                    <RadioOption value="current" selected={ownerMode === 'current'} onChange={setOwnerMode}
                      label="Current Logged-in User"
                      desc="Assign all imported leads to yourself." />
                    <RadioOption value="select" selected={ownerMode === 'select'} onChange={setOwnerMode}
                      label="Select CRM User"
                      desc="Choose a specific user to assign all imported leads.">
                      <select value={selectedOwner} onChange={e => setSelectedOwner(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 9, border: '1.5px solid #6366f1', fontSize: 13, background: 'white', outline: 'none' }}>
                        <option value="">Select User...</option>
                        <option>Admin</option>
                        {/* <option>John</option> */}
                        <option>Sales Team</option>
                        <option>Marketing</option>
                      </select>
                    </RadioOption>
                  </SectionCard>
                </div>

                {/* S4: Automation */}
                <SectionCard title="Automation Rules" icon={Zap} iconColor="#f59e0b" iconBg="#fffbeb">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
                    {[
                      { k: 'workflows', l: 'Trigger Workflow Rules' },
                      { k: 'assignments', l: 'Trigger Assignment Rules' },
                      { k: 'approvals', l: 'Trigger Approval Process' },
                      { k: 'notifications', l: 'Trigger Notifications' },
                      { k: 'activity', l: 'Create Activity History' },
                    ].map(({ k, l }) => (
                      <CheckboxItem key={k} checked={automation[k]} onChange={() => setAutomation(p => ({ ...p, [k]: !p[k] }))} label={l} />
                    ))}
                  </div>
                </SectionCard>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {/* S5: Tags */}
                  <SectionCard title="Tags" icon={Tag} iconColor="#6366f1" iconBg="#f5f3ff">
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 8 }}>
                      Apply Tags to All Imported Records
                    </label>
                    <TagInput tags={tags} onChange={setTags} />
                    <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>Press Enter or comma to add a tag</p>
                  </SectionCard>

                  {/* S6: Lead Source */}
                  <SectionCard title="Default Lead Source" icon={Globe} iconColor="#0ea5e9" iconBg="#f0f9ff">
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 8 }}>
                      Override Source (when not in file)
                    </label>
                    <select value={defaultSource} onChange={e => setDefaultSource(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 13, background: 'white', color: '#374151', outline: 'none' }}>
                      <option value="">Leave Unchanged / From File</option>
                      {VALID_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </SectionCard>
                </div>

                {/* S7: Preview Summary */}
                <SectionCard title="Preview Summary" icon={Eye} iconColor="#64748b" iconBg="#f8fafc">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
                    {[
                      { label: 'Rows in File', val: rawData.length, clr: '#6366f1', bg: '#f5f3ff' },
                      { label: 'Will Create', val: rawData.length, clr: '#10b981', bg: '#f0fdf4' },
                      { label: 'Will Update', val: 0, clr: '#f59e0b', bg: '#fffbeb' },
                      { label: 'Duplicates', val: 0, clr: '#ef4444', bg: '#fef2f2' },
                      { label: 'Skipped', val: 0, clr: '#64748b', bg: '#f8fafc' },
                    ].map((item, i) => (
                      <div key={i} style={{ textAlign: 'center', padding: '16px 8px', borderRadius: 12, background: item.bg }}>
                        <div style={{ fontSize: 28, fontWeight: 900, color: item.clr }}>{item.val.toLocaleString()}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginTop: 4 }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 10, textAlign: 'center' }}>
                    * Exact counts will be determined after validation
                  </p>
                </SectionCard>
              </div>
            )}

            {/* ══════════════════════════════════════
                STEP 3 — VALIDATE
            ══════════════════════════════════════ */}
            {step === 3 && (
              <div className="import-wizard-step" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                  {[
                    { label: 'Valid Records', val: validCount, clr: '#059669', bg: '#f0fdf4', brd: '#a7f3d0', icon: <CheckCircle2 size={22} color="#059669" /> },
                    { label: 'Warnings', val: warnCount, clr: '#d97706', bg: '#fffbeb', brd: '#fde68a', icon: <AlertTriangle size={22} color="#d97706" /> },
                    { label: 'Errors', val: errorCount, clr: '#dc2626', bg: '#fef2f2', brd: '#fecaca', icon: <XCircle size={22} color="#dc2626" /> },
                    { label: 'Duplicates', val: dupCount, clr: '#7c3aed', bg: '#f5f3ff', brd: '#ddd6fe', icon: <Copy size={22} color="#7c3aed" /> },
                  ].map((item, i) => (
                    <div key={i} style={{
                      padding: '18px', borderRadius: 14, background: item.bg, border: `1.5px solid ${item.brd}`,
                      display: 'flex', alignItems: 'center', gap: 14,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }}>
                      <div style={{ flexShrink: 0 }}>{item.icon}</div>
                      <div>
                        <div style={{ fontSize: 28, fontWeight: 900, color: item.clr }}>{item.val}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>{item.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Validation Table */}
                <div style={{ background: 'white', borderRadius: 14, border: '1.5px solid #e8ecf4', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>Validation Results</span>
                      <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 8 }}>
                        {validationResults.length > 50 ? `Showing first 50 of ${validationResults.length}` : `${validationResults.length} rows`}
                      </span>
                    </div>
                    <button onClick={downloadValidationReport} style={{
                      padding: '7px 14px', borderRadius: 9, border: '1.5px solid #e2e8f0',
                      background: 'white', color: '#374151', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <Download size={13} /> Download Report
                    </button>
                  </div>
                  <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                        <tr style={{ background: 'linear-gradient(135deg,#f8fafc,#f1f5ff)', borderBottom: '1.5px solid #e8ecf4' }}>
                          {['#', 'Status', 'Company', 'Phone', 'Issues'].map((h, i) => (
                            <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {validationResults.slice(0, 50).map((r) => (
                          <tr key={r.index} className="iw-row" style={{ borderBottom: '1px solid #f8fafc', background: r.errors.length > 0 ? '#fff8f8' : r.isDuplicate ? '#fffef0' : 'white', transition: 'background 0.12s' }}>
                            <td style={{ padding: '10px 14px', fontSize: 12, color: '#94a3b8', fontWeight: 700 }}>{r.index + 1}</td>
                            <td style={{ padding: '10px 14px' }}>
                              {r.errors.length > 0 ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '3px 10px', borderRadius: 20 }}>
                                  <XCircle size={11} /> Error
                                </span>
                              ) : r.isDuplicate ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '3px 10px', borderRadius: 20 }}>
                                  <Copy size={11} /> Duplicate
                                </span>
                              ) : r.warnings.length > 0 ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#d97706', background: '#fef9c3', padding: '3px 10px', borderRadius: 20 }}>
                                  <AlertTriangle size={11} /> Warning
                                </span>
                              ) : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '3px 10px', borderRadius: 20 }}>
                                  <CheckCircle2 size={11} /> Valid
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '10px 14px', fontSize: 13, color: '#374151' }}>{r.row.company || <span style={{ color: '#d1d5db' }}>—</span>}</td>
                            <td style={{ padding: '10px 14px', fontSize: 13, color: '#374151' }}>{r.row.phone || <span style={{ color: '#d1d5db' }}>—</span>}</td>
                            <td style={{ padding: '10px 14px', fontSize: 12, color: r.errors.length > 0 ? '#dc2626' : '#d97706', maxWidth: 260 }}>
                              {[...r.errors, ...r.warnings].join('; ') || <span style={{ color: '#d1d5db' }}>—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {validationResults.length > 50 && (
                      <div style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', padding: '12px', borderTop: '1px solid #f1f5f9', fontWeight: 600 }}>
                        Showing first 50 of {validationResults.length} rows — Download report for full results
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════
                STEP 4 — IMPORT PROGRESS
            ══════════════════════════════════════ */}
            {step === 4 && (
              <div className="import-wizard-step" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 420, gap: 30, padding: '20px 0' }}>
                {/* Spinner */}
                <div className="import-wizard-pulse" style={{
                  width: 100, height: 100, borderRadius: 26,
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 20px 56px rgba(99,102,241,0.42)',
                }}>
                  <Loader2 size={48} color="white" className="import-wizard-spin" />
                </div>

                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ fontSize: 24, fontWeight: 900, color: '#1e293b', marginBottom: 6, letterSpacing: '-0.02em' }}>
                    Importing Leads...
                  </h3>
                  <p style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>{statusMsg}</p>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', maxWidth: 520 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
                      Processing record <strong>{importProgress.done}</strong> of <strong>{importProgress.total}</strong>
                    </span>
                    <span style={{ fontSize: 20, fontWeight: 900, color: '#6366f1' }}>{progressPct}%</span>
                  </div>
                  <div style={{ height: 14, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                    <div className="import-striped-bar" style={{
                      height: '100%', borderRadius: 99, width: `${progressPct}%`,
                      background: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>✓ {importProgress.success} imported</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>✗ {importProgress.failed} failed</span>
                  </div>
                </div>

                {/* Mini stat cards */}
                <div style={{ display: 'flex', gap: 14 }}>
                  {[
                    { label: 'Imported', val: importProgress.success, clr: '#059669', bg: '#f0fdf4' },
                    { label: 'Failed', val: importProgress.failed, clr: '#dc2626', bg: '#fef2f2' },
                    { label: 'Remaining', val: importProgress.total - importProgress.done, clr: '#6366f1', bg: '#f5f3ff' },
                  ].map((item, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '14px 24px', borderRadius: 14, background: item.bg, minWidth: 110 }}>
                      <div style={{ fontSize: 26, fontWeight: 900, color: item.clr }}>{item.val}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginTop: 2 }}>{item.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '10px 20px', background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a' }}>
                  <span style={{ fontSize: 12, color: '#92400e', fontWeight: 600 }}>
                    ⚠ Please do not close this window while the import is in progress.
                  </span>
                </div>

                <button onClick={() => { cancelFlagRef.current = true; }} style={{
                  padding: '8px 22px', borderRadius: 9, border: '1.5px solid #fecaca',
                  background: '#fef2f2', color: '#dc2626', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}>
                  Cancel Import
                </button>
              </div>
            )}

            {/* ══════════════════════════════════════
                STEP 5 — SUMMARY
            ══════════════════════════════════════ */}
            {step === 5 && (
              <div className="import-wizard-step" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Hero */}
                <div style={{ textAlign: 'center', padding: '20px 0 4px' }}>
                  <div className="import-wizard-success" style={{
                    width: 88, height: 88, borderRadius: 26, margin: '0 auto 18px',
                    background: importProgress.failed === 0 ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#f59e0b,#d97706)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 20px 56px ${importProgress.failed === 0 ? 'rgba(16,185,129,0.38)' : 'rgba(245,158,11,0.38)'}`,
                  }}>
                    {importProgress.failed === 0 ? <CheckCircle size={44} color="white" /> : <AlertTriangle size={44} color="white" />}
                  </div>
                  <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', marginBottom: 8, letterSpacing: '-0.02em' }}>
                    {importProgress.failed === 0 ? 'Import Completed Successfully! 🎉' : 'Import Finished with Issues'}
                  </h2>
                  <p style={{ fontSize: 15, color: '#64748b', fontWeight: 500 }}>
                    {importProgress.success.toLocaleString()} records imported
                    {importProgress.failed > 0 && ` · ${importProgress.failed} failed`}
                    {importProgress.skipped > 0 && ` · ${importProgress.skipped} skipped`}
                  </p>
                </div>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10 }}>
                  {[
                    { label: 'Imported', val: importProgress.success, clr: '#059669', bg: '#f0fdf4', brd: '#a7f3d0' },
                    { label: 'Updated', val: 0, clr: '#6366f1', bg: '#f5f3ff', brd: '#c7d2fe' },
                    { label: 'Failed', val: importProgress.failed, clr: '#dc2626', bg: '#fef2f2', brd: '#fecaca' },
                    { label: 'Skipped', val: importProgress.skipped, clr: '#64748b', bg: '#f8fafc', brd: '#e2e8f0' },
                    { label: 'Duplicates', val: dupCount, clr: '#7c3aed', bg: '#f5f3ff', brd: '#ddd6fe' },
                    { label: 'Total', val: importProgress.total, clr: '#0f172a', bg: '#f1f5f9', brd: '#cbd5e1' },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: '14px 6px', borderRadius: 14, background: item.bg, border: `1.5px solid ${item.brd}`, textAlign: 'center' }}>
                      <div style={{ fontSize: 26, fontWeight: 900, color: item.clr }}>
                        <AnimatedCounter target={item.val} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', marginTop: 4 }}>{item.label}</div>
                    </div>
                  ))}
                </div>

                {/* Import Details */}
                <div style={{ ...S.card, padding: '18px 20px' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Import Details</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                    {[
                      { label: 'Filename', val: file?.name || '—', icon: <FileSpreadsheet size={14} color="#6366f1" /> },
                      { label: 'Started', val: formatTime(importStartTime), icon: <Clock size={14} color="#6366f1" /> },
                      { label: 'Completed', val: formatTime(importEndTime), icon: <CheckCircle2 size={14} color="#10b981" /> },
                      { label: 'Duration', val: getDuration(), icon: <Activity size={14} color="#f59e0b" /> },
                      { label: 'Rows Processed', val: importProgress.total.toLocaleString(), icon: <BarChart2 size={14} color="#8b5cf6" /> },
                      { label: 'Imported By', val: 'Current User', icon: <User size={14} color="#64748b" /> },
                    ].map((item, i) => (
                      <div key={i} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ marginTop: 1, flexShrink: 0 }}>{item.icon}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', marginTop: 3, wordBreak: 'break-word' }}>{item.val}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Failed Records */}
                {importErrors.length > 0 && (
                  <div style={{ background: 'white', borderRadius: 14, border: '1.5px solid #fecaca', boxShadow: '0 1px 6px rgba(220,38,38,0.07)', overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', background: '#fef9f9', borderBottom: '1px solid #fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <XCircle size={18} color="#dc2626" />
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#dc2626' }}>Failed Records ({importErrors.length})</span>
                      </div>
                      <button onClick={downloadErrorReport} style={{
                        padding: '6px 14px', borderRadius: 9, border: '1.5px solid #fecaca',
                        background: 'white', color: '#dc2626', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        <Download size={13} /> Download Error Report
                      </button>
                    </div>
                    <div style={{ maxHeight: 200, overflowY: 'auto', padding: '4px 0' }}>
                      {importErrors.slice(0, 30).map((err, i) => (
                        <div key={i} style={{ display: 'flex', gap: 16, padding: '9px 20px', borderBottom: '1px solid #fff0f0', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, color: '#94a3b8', fontSize: 12, minWidth: 55 }}>Row {err.row}</span>
                          <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 500 }}>{err.error}</span>
                        </div>
                      ))}
                      {importErrors.length > 30 && (
                        <div style={{ textAlign: 'center', padding: '10px', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                          +{importErrors.length - 30} more — Download error report for full list
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── STICKY FOOTER ── */}
          <div style={{
            flexShrink: 0, background: 'white',
            borderTop: '1.5px solid #e8ecf4',
            padding: '14px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
          }}>
            {/* Status hint */}
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              {step === 0 && <span style={{ color: '#94a3b8' }}>Upload a CSV or Excel file to begin</span>}
              {step === 1 && (
                <span style={{ color: mappingPct === 100 ? '#059669' : '#6366f1' }}>
                  {mappedCount} of {headers.length} columns mapped ({mappingPct}%)
                </span>
              )}
              {step === 2 && <span style={{ color: '#64748b' }}>Configure import options before validating</span>}
              {step === 3 && (
                <span style={{ color: validCount > 0 ? '#059669' : '#dc2626' }}>
                  {validCount} records ready · {errorCount > 0 ? `${errorCount} errors` : 'No errors'}
                  {dupCount > 0 ? ` · ${dupCount} duplicates` : ''}
                </span>
              )}
              {step === 5 && (
                <span style={{ color: '#059669' }}>✓ Import complete — {importProgress.success} leads added to CRM</span>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {/* Back */}
              {step > 0 && step < 4 && (
                <button onClick={() => setStep(s => s - 1)} className="iw-back-btn" style={{
                  ...S.btn('secondary'),
                  border: '1.5px solid #e2e8f0', transition: 'all 0.15s ease',
                }}>
                  <ArrowLeft size={15} /> Back
                </button>
              )}

              {/* Step 1 → Next */}
              {step === 1 && (
                <button onClick={() => setStep(2)} style={S.btn()}>
                  Next <ArrowRight size={15} />
                </button>
              )}

              {/* Step 2 → Validate */}
              {step === 2 && (
                <button onClick={proceedToValidation} style={S.btn()}>
                  <Shield size={15} /> Validate Data <ArrowRight size={15} />
                </button>
              )}

              {/* Step 3 → Start Import */}
              {step === 3 && (
                <>
                  <button onClick={downloadValidationReport} style={S.btn('secondary')}>
                    <Download size={14} /> Report
                  </button>
                  <button
                    onClick={startImport}
                    disabled={validCount === 0}
                    style={{
                      ...S.btn('success'),
                      opacity: validCount === 0 ? 0.5 : 1,
                      cursor: validCount === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Play size={15} /> Start Import ({validCount} leads)
                  </button>
                </>
              )}

              {/* Step 5 — Summary actions */}
              {step === 5 && (
                <>
                  <button onClick={reset} style={S.btn('secondary')}>
                    <RotateCcw size={14} /> Import More
                  </button>
                  {importErrors.length > 0 && (
                    <button onClick={downloadErrorReport} style={S.btn('danger')}>
                      <Download size={14} /> Error Report
                    </button>
                  )}
                  <button onClick={() => onImportComplete()} style={S.btn()}>
                    <CheckCircle size={15} /> View Imported Leads
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
