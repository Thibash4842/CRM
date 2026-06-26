import { useEffect, useState, useCallback, useMemo } from 'react';
import { Trash2, Search, Filter, RotateCcw, XCircle, AlertTriangle } from 'lucide-react';
import { leadsApi } from '../services/api';
import PageHeader, { FilterSelect, EmptyState, LoadingSpinner } from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/constants';

export default function Trash() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');

  const fetchTrash = useCallback(async () => {
    setLoading(true);
    try {
      const res = await leadsApi.getTrash();
      setLeads(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTrash(); }, [fetchTrash]);

  const handleRestore = async (id) => {
    try {
      await leadsApi.restore(id);
      fetchTrash();
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this lead? This action cannot be undone.')) return;
    try {
      await leadsApi.delete(id);
      fetchTrash();
    } catch (err) {
      alert(err.message);
    }
  };

  const reasons = useMemo(() => {
    const r = new Set(leads.map(l => l.lossReason).filter(Boolean));
    return [{ value: '', label: 'All Reasons' }, ...Array.from(r).map(reason => ({ value: reason, label: reason }))];
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (search && !l.fullName?.toLowerCase().includes(search.toLowerCase()) && !l.company?.toLowerCase().includes(search.toLowerCase())) return false;
      if (reasonFilter && l.lossReason !== reasonFilter) return false;
      return true;
    });
  }, [leads, search, reasonFilter]);

  return (
    <div>
      <PageHeader
        title="Trash Management"
        subtitle="View, restore, or permanently delete lost leads"
        search={search}
        onSearch={setSearch}
        filters={
          <FilterSelect value={reasonFilter} onChange={setReasonFilter} options={reasons} label="Filter by Reason" />
        }
      />

      {loading ? (
        <LoadingSpinner />
      ) : leads.length === 0 ? (
        <EmptyState icon={Trash2} title="Trash is empty" description="No deleted leads found." />
      ) : (
        <div className="grid gap-4">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="glass-card p-4 rounded-2xl w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-slate-500 shadow-slate-500/10 transition-all">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-semibold text-lg">
                  {(lead.firstName?.[0] || '') + (lead.lastName?.[0] || '')}
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 truncate line-through">{lead.fullName || `${lead.firstName} ${lead.lastName}`}</h4>
                  <p className="text-sm text-slate-500 truncate">{lead.company} · {lead.email}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-red-500">
                    <span className="flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Lost: {lead.lossReason}</span>
                    <span className="text-slate-500">Deleted on {formatDateTime(lead.deletedAt)} by {lead.deletedByName}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button variant="secondary" onClick={() => handleRestore(lead.id)}>
                  <RotateCcw className="w-4 h-4 mr-2" /> Restore
                </Button>
                {isAdmin && (
                  <Button variant="danger" onClick={() => handlePermanentDelete(lead.id)}>
                    <AlertTriangle className="w-4 h-4 mr-2" /> Delete Permanently
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
