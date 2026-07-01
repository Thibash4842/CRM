import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Send, CheckCircle, Clock, Search, Plus, 
  Filter, RefreshCw, Download, MoreVertical, Edit, 
  Copy, Trash2, FileOutput, ChevronLeft, ChevronRight 
} from 'lucide-react';
import PageHeader, { FilterSelect, LoadingSpinner, EmptyState } from '../components/ui/PageHeader';
import Card, { StatCard } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

import { useFinance } from '../context/FinanceContext';

const getStatusBadge = (status) => {
  const normStatus = status ? status.toUpperCase() : '';
  switch (normStatus) {
    case 'DRAFT': return { color: 'slate', label: 'Draft' };
    case 'PENDING_APPROVAL': return { color: 'yellow', label: 'Pending Approval' };
    case 'SENT': return { color: 'blue', label: 'Sent' };
    case 'ACCEPTED': return { color: 'emerald', label: 'Accepted' };
    case 'REJECTED': return { color: 'red', label: 'Rejected' };
    case 'EXPIRED': return { color: 'orange', label: 'Expired' };
    default: return { color: 'slate', label: status || 'Unknown' };
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export default function Quotes() {
  const navigate = useNavigate();
  const { quotes, updateQuoteStatus, deleteQuote } = useFinance();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'issueDate', direction: 'desc' });
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500); // Simulate API call
  };

  useEffect(() => {
    loadData();
  }, [quotes]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedQuotes = useMemo(() => {
    let result = [...quotes];
    if (search) {
      result = result.filter(q => 
        (q.quoteNumber || '').toLowerCase().includes(search.toLowerCase()) || 
        (q.clientName || '').toLowerCase().includes(search.toLowerCase()) ||
        (q.ownerName || '').toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter) {
      result = result.filter(q => q.status === statusFilter);
    }
    if (dateFilter) {
      // Basic date filter logic for demonstration
      result = result.filter(q => (q.issueDate || '').startsWith(dateFilter));
    }
    
    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [quotes, search, statusFilter, dateFilter, sortConfig]);

  const paginatedQuotes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedQuotes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedQuotes, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedQuotes.length / itemsPerPage);

  const stats = useMemo(() => {
    return {
      total: quotes.length,
      draft: quotes.filter(q => q.status === 'DRAFT').length,
      sent: quotes.filter(q => q.status === 'SENT').length,
      accepted: quotes.filter(q => q.status === 'ACCEPTED').length,
      expired: quotes.filter(q => q.status === 'EXPIRED').length,
    };
  }, [quotes]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(paginatedQuotes.map(q => q.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Breadcrumb & Header section */}
      <div>
        <nav className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
          Finance <span className="mx-2">/</span> <span className="text-slate-900 dark:text-white">Quotes</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quotes</h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search quotes..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <FilterSelect 
              value={statusFilter} 
              onChange={setStatusFilter}
              options={[
                { value: 'DRAFT', label: 'Draft' },
                { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
                { value: 'SENT', label: 'Sent' },
                { value: 'ACCEPTED', label: 'Accepted' },
                { value: 'REJECTED', label: 'Rejected' },
                { value: 'EXPIRED', label: 'Expired' }
              ]}
              label="All Statuses"
            />
            <input 
              type="month" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <Button variant="secondary" onClick={loadData} title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="secondary" title="Export">
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
            <Button onClick={() => navigate('/quotes/create')}>
              <Plus className="w-4 h-4 mr-2" /> Create Quote
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Quotes" value={stats.total} icon={FileText} color="from-indigo-500 to-purple-600" trend={{ positive: true, value: 5 }} />
        <StatCard title="Draft" value={stats.draft} icon={FileText} color="from-slate-500 to-slate-600" trend={{ positive: true, value: 2 }} />
        <StatCard title="Sent" value={stats.sent} icon={Send} color="from-blue-500 to-cyan-600" trend={{ positive: true, value: 8 }} />
        <StatCard title="Accepted" value={stats.accepted} icon={CheckCircle} color="from-emerald-500 to-teal-600" trend={{ positive: true, value: 12 }} />
        <StatCard title="Expired" value={stats.expired} icon={Clock} color="from-red-500 to-rose-600" trend={{ positive: false, value: 1 }} />
      </div>

      {/* Table Section */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            ))}
          </div>
        ) : filteredAndSortedQuotes.length === 0 ? (
          <EmptyState 
            icon={FileText} 
            title="No quotes found" 
            description="We couldn't find any quotes matching your criteria." 
            action={<Button onClick={() => navigate('/quotes/create')}><Plus className="w-4 h-4 mr-2" /> Create Quote</Button>} 
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400 sticky top-0 z-10">
                <tr>
                  <th className="p-4 w-4">
                    <input type="checkbox" checked={selectedRows.length === paginatedQuotes.length && paginatedQuotes.length > 0} onChange={handleSelectAll} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  </th>
                  {[
                    { key: 'quoteNumber', label: 'Quote Number' },
                    { key: 'clientName', label: 'Customer' },
                    { key: 'ownerName', label: 'Owner' },
                    { key: 'amount', label: 'Amount' },
                    { key: 'issueDate', label: 'Issue Date' },
                    { key: 'expiryDate', label: 'Expiry Date' },
                    { key: 'status', label: 'Status' }
                  ].map(col => (
                    <th key={col.key} className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort(col.key)}>
                      <div className="flex items-center gap-2">
                        {col.label}
                        {sortConfig.key === col.key && (
                          <span className="text-indigo-500">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedQuotes.map((quote) => {
                  const badge = getStatusBadge(quote.status);
                  return (
                    <tr key={quote.id} className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <input type="checkbox" checked={selectedRows.includes(quote.id)} onChange={() => handleSelectRow(quote.id)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      </td>
                      <td className="px-6 py-4 font-medium text-indigo-600 dark:text-indigo-400">{quote.quoteNumber}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{quote.clientName}</td>
                      <td className="px-6 py-4">{quote.ownerName}</td>
                      <td className="px-6 py-4 font-bold">{formatCurrency(quote.amount)}</td>
                      <td className="px-6 py-4">{quote.issueDate || (quote.createdAt ? quote.createdAt.substring(0, 10) : '')}</td>
                      <td className="px-6 py-4">{quote.expiryDate}</td>
                      <td className="px-6 py-4">
                        <Badge color={badge.color}>{badge.label}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button 
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded"
                          onClick={() => setActiveDropdown(activeDropdown === quote.id ? null : quote.id)}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {activeDropdown === quote.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                            <div className="absolute right-6 top-10 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-fade-in">
                              <button onClick={() => navigate(`/quotes/${quote.id}`, { state: { quote } })} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> View
                              </button>
                              <button onClick={() => navigate(`/quotes/${quote.id}`, { state: { quote } })} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2">
                                <Edit className="w-4 h-4" /> Edit
                              </button>
                              <button onClick={() => navigate('/quotes/create', { state: { quote } })} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2">
                                <Copy className="w-4 h-4" /> Duplicate
                              </button>
                              <button onClick={() => { alert("Generating PDF..."); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2">
                                <Download className="w-4 h-4" /> Download PDF
                              </button>
                              <button onClick={() => navigate('/invoices/create', { state: { customer: quote.clientId, amount: quote.amount } })} className="w-full text-left px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700">
                                <FileOutput className="w-4 h-4" /> Convert to Invoice
                              </button>
                              <button onClick={() => { if(window.confirm('Delete this quote?')) { deleteQuote(quote.id); setActiveDropdown(null); } }} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2">
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Pagination */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedQuotes.length)} of {filteredAndSortedQuotes.length} Quotes
              </span>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="secondary" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
