import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingDown, Search, Plus, 
  RefreshCw, Download, MoreVertical, 
  FileText, ChevronLeft, ChevronRight, CheckCircle, Clock, XCircle, DollarSign
} from 'lucide-react';
import PageHeader, { FilterSelect, EmptyState } from '../components/ui/PageHeader';
import Card, { StatCard } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

import { useFinance } from '../context/FinanceContext';

const getStatusBadge = (status) => {
  const normStatus = status ? status.toUpperCase() : '';
  switch (normStatus) {
    case 'DRAFT': return { color: 'slate', label: 'Draft' };
    case 'PENDING_APPROVAL': return { color: 'yellow', label: 'Pending' };
    case 'APPROVED': return { color: 'indigo', label: 'Approved' };
    case 'REIMBURSED': return { color: 'emerald', label: 'Reimbursed' };
    case 'REJECTED': return { color: 'red', label: 'Rejected' };
    default: return { color: 'slate', label: status || 'Unknown' };
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
};

export default function Expenses() {
  const navigate = useNavigate();
  const { expenses } = useFinance();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadData();
  }, [expenses]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...expenses];
    if (search) {
      result = result.filter(q => 
        (q.expenseNumber || '').toLowerCase().includes(search.toLowerCase()) || 
        (q.employeeName || '').toLowerCase().includes(search.toLowerCase()) ||
        (q.vendor || '').toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter) {
      result = result.filter(q => q.status === statusFilter);
    }
    if (dateFilter) {
      result = result.filter(q => (q.date || '').startsWith(dateFilter));
    }
    
    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [expenses, search, statusFilter, dateFilter, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSorted.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSorted, currentPage]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);

  const stats = useMemo(() => {
    return {
      total: expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
      pending: expenses.filter(e => e.status === 'PENDING_APPROVAL').reduce((sum, e) => sum + (e.amount || 0), 0),
      reimbursed: expenses.filter(e => e.status === 'REIMBURSED').reduce((sum, e) => sum + (e.amount || 0), 0),
      rejected: expenses.filter(e => e.status === 'REJECTED').reduce((sum, e) => sum + (e.amount || 0), 0)
    };
  }, [expenses]);

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedRows(paginatedData.map(q => q.id));
    else setSelectedRows([]);
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]);
  };

  return (
    <div className="w-full space-y-6">
      {/* Breadcrumb & Header section */}
      <div>
        <nav className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
          Finance <span className="mx-2">/</span> <span className="text-slate-900 dark:text-white">Expenses</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Expenses</h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search expenses..." 
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
                { value: 'APPROVED', label: 'Approved' },
                { value: 'REIMBURSED', label: 'Reimbursed' },
                { value: 'REJECTED', label: 'Rejected' }
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
            <Button onClick={() => navigate('/expenses/create')}>
              <Plus className="w-4 h-4 mr-2" /> Record Expense
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Expenses" value={formatCurrency(stats.total)} icon={TrendingDown} color="from-indigo-500 to-purple-600" trend={{ positive: false, value: 5 }} />
        <StatCard title="Pending Approval" value={formatCurrency(stats.pending)} icon={Clock} color="from-amber-500 to-orange-600" />
        <StatCard title="Reimbursed" value={formatCurrency(stats.reimbursed)} icon={CheckCircle} color="from-emerald-500 to-teal-600" trend={{ positive: true, value: 12 }} />
        <StatCard title="Rejected" value={formatCurrency(stats.rejected)} icon={XCircle} color="from-red-500 to-rose-600" />
      </div>

      {/* Table Section */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            ))}
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <EmptyState 
            icon={TrendingDown} 
            title="No expenses found" 
            description="We couldn't find any expenses matching your criteria." 
            action={<Button onClick={() => navigate('/expenses/create')}><Plus className="w-4 h-4 mr-2" /> Record Expense</Button>} 
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400 sticky top-0 z-10">
                <tr>
                  <th className="p-4 w-4">
                    <input type="checkbox" checked={selectedRows.length === paginatedData.length && paginatedData.length > 0} onChange={handleSelectAll} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  </th>
                  {[
                    { key: 'expenseNumber', label: 'Expense ID' },
                    { key: 'employeeName', label: 'Employee' },
                    { key: 'category', label: 'Category' },
                    { key: 'vendor', label: 'Vendor' },
                    { key: 'date', label: 'Date' },
                    { key: 'amount', label: 'Amount' },
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
                {paginatedData.map((exp) => {
                  const badge = getStatusBadge(exp.status);
                  return (
                    <tr key={exp.id} className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <input type="checkbox" checked={selectedRows.includes(exp.id)} onChange={() => handleSelectRow(exp.id)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      </td>
                      <td className="px-6 py-4 font-medium text-indigo-600 dark:text-indigo-400">{exp.expenseNumber}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{exp.employeeName}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{exp.category}</td>
                      <td className="px-6 py-4">{exp.vendor}</td>
                      <td className="px-6 py-4">{exp.date}</td>
                      <td className="px-6 py-4 font-bold">{formatCurrency(exp.amount)}</td>
                      <td className="px-6 py-4">
                        <Badge color={badge.color}>{badge.label}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button 
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded"
                          onClick={() => setActiveDropdown(activeDropdown === exp.id ? null : exp.id)}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {activeDropdown === exp.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                            <div className="absolute right-6 top-10 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-fade-in">
                              <button onClick={() => navigate(`/expenses/${exp.id}`)} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> View / Edit
                              </button>
                              {exp.status === 'PENDING_APPROVAL' && (
                                <>
                                  <button onClick={() => navigate(`/expenses/${exp.id}`)} className="w-full text-left px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700">
                                    <CheckCircle className="w-4 h-4" /> Quick Approve
                                  </button>
                                  <button onClick={() => navigate(`/expenses/${exp.id}`)} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2">
                                    <XCircle className="w-4 h-4" /> Reject
                                  </button>
                                </>
                              )}
                              {exp.status === 'APPROVED' && (
                                <button onClick={() => navigate(`/expenses/${exp.id}`)} className="w-full text-left px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700">
                                  <DollarSign className="w-4 h-4" /> Reimburse
                                </button>
                              )}
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSorted.length)} of {filteredAndSorted.length} Expenses
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
