import Papa from 'papaparse';
import * as XLSX from 'xlsx-js-style';
import { FileText, FileSpreadsheet, Download, FileJson, X } from 'lucide-react';
import Button from '../ui/Button';

const TEMPLATES = [
  {
    id: 'leads',
    title: 'Lead Import Template',
    description: 'Use this template to bulk import raw leads. Includes standard CRM fields like source and status.',
    icon: FileJson,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-900/30',
    headers: ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Job Title', 'Source', 'Status', 'Notes'],
    sample: [
      ['John', 'Smith', 'john.smith@acme.com', '+1-555-0101', 'Acme Corp', 'VP Sales', 'Website', 'NEW', 'Interested in enterprise plan'],
      ['Sarah', 'Johnson', 'sarah.j@globex.com', '+1-555-0102', 'Globex Inc', 'CTO', 'LinkedIn', 'CONTACTED', 'Requested demo this week'],
      ['Michael', 'Chen', 'mchen@initech.io', '+1-555-0103', 'Initech', 'Director of IT', 'Referral', 'MEETING', 'Meeting scheduled for Friday'],
    ],
  },
  {
    id: 'contacts',
    title: 'Contact Import Template',
    description: 'Import established contacts with associated account links and detailed information.',
    icon: FileText,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    headers: ['First Name', 'Last Name', 'Email', 'Phone', 'Job Title', 'Department', 'Account Name', 'LinkedIn URL'],
    sample: [
      ['Emily', 'Rodriguez', 'emily@innovate.io', '+1-555-0201', 'CFO', 'Finance', 'Innovate IO', 'linkedin.com/in/erodriguez'],
      ['David', 'Kim', 'dkim@nexus.net', '+1-555-0202', 'Head of Procurement', 'Operations', 'Nexus Networks', 'linkedin.com/in/dkim'],
    ],
  },
  {
    id: 'accounts',
    title: 'Account Import Template',
    description: 'Import company accounts with industry, size, and address details.',
    icon: FileSpreadsheet,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    headers: ['Account Name', 'Website', 'Industry', 'Employees', 'Annual Revenue', 'Phone', 'Billing City', 'Billing Country'],
    sample: [
      ['Innovate IO', 'innovate.io', 'Technology', '50-200', '$10M-$50M', '+1-800-555-1234', 'San Francisco', 'USA'],
      ['Nexus Networks', 'nexus.net', 'Telecommunications', '1000+', '$100M+', '+1-800-555-9876', 'London', 'UK'],
    ],
  },
];

export default function Templates({ isOpen, onClose }) {
  const downloadCSV = (template) => {
    const csv = Papa.unparse({ fields: template.headers, data: template.sample });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, `${template.id}-import-template.csv`);
  };

  const downloadExcel = (template) => {
    const data = [template.headers, ...template.sample];
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Style header row
    template.headers.forEach((_, i) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '4F46E5' } },
          alignment: { horizontal: 'center' },
        };
      }
    });

    // Style sample rows slightly gray
    template.sample.forEach((_, rowIndex) => {
      template.headers.forEach((__, colIndex) => {
        const cellRef = XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex });
        if (ws[cellRef]) {
          ws[cellRef].s = {
            fill: { fgColor: { rgb: (rowIndex % 2 === 0) ? 'F8FAFC' : 'FFFFFF' } },
          };
        }
      });
    });

    // Set column widths
    ws['!cols'] = template.headers.map(() => ({ wch: 20 }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `${template.id}-import-template.xlsx`);
  };

  const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="ml-auto relative w-full max-w-5xl bg-white dark:bg-slate-900 h-full shadow-2xl animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-5 border-b border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Download Templates</h2>
              <p className="text-xs text-slate-500">Get formatted templates with sample data for bulk importing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {TEMPLATES.map((tpl) => (
              <div key={tpl.id} className="glass-card flex flex-col hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${tpl.bg}`}>
                    <tpl.icon className={`w-6 h-6 ${tpl.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{tpl.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{tpl.description}</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 mb-6 flex-1">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">Included Columns</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tpl.headers.slice(0, 5).map(h => (
                      <span key={h} className="text-xs px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300">
                        {h}
                      </span>
                    ))}
                    {tpl.headers.length > 5 && (
                      <span className="text-xs px-2 py-1 bg-transparent text-slate-400 italic">+{tpl.headers.length - 5} more</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <Button variant="outline" onClick={() => downloadCSV(tpl)}>
                    <Download className="w-4 h-4 mr-2" /> CSV
                  </Button>
                  <Button onClick={() => downloadExcel(tpl)}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
