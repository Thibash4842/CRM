import { useEffect, useState, useMemo, useCallback } from 'react';
import { Target } from 'lucide-react';
import { leadsApi, clientsApi } from '../services/api';
import { useLeadsContext } from '../context/LeadContext';
import PageHeader, { FilterSelect, EmptyState, LoadingSpinner } from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import Drawer from '../components/ui/Drawer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LeadCard from '../components/leads/LeadCard';
import LeadConversionModal from '../components/leads/LeadConversionModal';
import LeadDetailsPanel from '../components/leads/LeadDetailsPanel';
import ImportLeads from '../components/leads/ImportLeads';
import ExportLeads from '../components/leads/ExportLeads';
import Templates from '../components/leads/Templates';
import SplitButton from '../components/ui/SplitButton';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Download, Upload, FileText, Plus, User, Phone, Calendar, CheckCircle, List, LayoutGrid, XCircle } from 'lucide-react';
import Papa from 'papaparse';


import { LEAD_STATUSES, LEAD_SOURCES, formatDateTime } from '../utils/constants';

const emptyForm = {
  firstName: '', lastName: '', email: '', phone: '', company: '',
  source: 'Website', status: 'NEW', priority: 'COLD', notes: '',
};

export default function Leads({ type = 'active' }) {
  const { leads, loading, fetchLeads: contextFetchLeads, updateLeadState } = useLeadsContext();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [kpiFilter, setKpiFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('overview');
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [ownerFilter, setOwnerFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [conversionModalOpen, setConversionModalOpen] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [bookedDetailsLead, setBookedDetailsLead] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  const handleStatusChange = async (newStatus) => {
    if (!bookedDetailsLead) return;
    const currentVal = bookedDetailsLead.status === 'WON' ? 'WON' : 'LOST';
    if (newStatus === currentVal) return;

    if (newStatus === 'LOST') {
      const confirmChange = window.confirm("Are you sure you want to change the status to Lost? This will move the lead to the Lost Leads section.");
      if (!confirmChange) return;

      setSaving(true);
      try {
        const updatedLead = await leadsApi.markLost(bookedDetailsLead.id, {
          reason: 'Status changed via Booking Details dropdown',
          notes: bookedDetailsLead.notes
        });
        updateLeadState(bookedDetailsLead.id, updatedLead);
        showToast('Status successfully changed to Lost!');
        setBookedDetailsLead(null);
        refreshLeads();
      } catch (err) {
        alert(err.message || 'Failed to update status');
      } finally {
        setSaving(false);
      }
    } else if (newStatus === 'WON') {
      const confirmChange = window.confirm("Are you sure you want to change the status to Booked?");
      if (!confirmChange) return;

      setSaving(true);
      try {
        const updatedLead = await leadsApi.convert(bookedDetailsLead.id);
        updateLeadState(bookedDetailsLead.id, updatedLead);
        showToast('Status successfully changed to Booked!');
        setBookedDetailsLead(null);
        refreshLeads();
      } catch (err) {
        alert(err.message || 'Failed to update status');
      } finally {
        setSaving(false);
      }
    }
  };

  const refreshLeads = useCallback(() => {
    contextFetchLeads(type, {}, true);
  }, [type, contextFetchLeads]);

  useEffect(() => {
    contextFetchLeads(type, {});
  }, [contextFetchLeads, type]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) await leadsApi.update(editing.id, form);
      else await leadsApi.create(form);
      setModalOpen(false);
      refreshLeads();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openConversionModal = (lead) => {
    setLeadToConvert(lead);
    setConversionModalOpen(true);
  };

  const handleConvertAction = async (leadId) => {
    setSaving(true);
    try {
      await leadsApi.convert(leadId);
      refreshLeads();
      setConversionModalOpen(false);
      showToast('Lead successfully converted!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLostAction = async (leadId, data) => {
    setSaving(true);
    try {
      await leadsApi.markLost(leadId, data);
      refreshLeads();
      setConversionModalOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatusAction = async (leadId, data) => {
    setSaving(true);
    try {
      await leadsApi.update(leadId, data);
      refreshLeads();
      setConversionModalOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLead = async (leadId, data) => {
    try {
      const updatedLead = await leadsApi.update(leadId, data);
      setSelectedLead(updatedLead);
      updateLeadState(leadId, updatedLead);
    } catch (err) {
      alert(err.message);
      throw err;
    }
  };

  const openDrawer = (lead, tab = 'overview') => { 
    setSelectedLead(lead); 
    setDrawerTab(tab);
    setDrawerOpen(true); 
  };
  const closeDrawer = () => { setSelectedLead(null); setDrawerOpen(false); };

  const handleQuickAction = (type, lead) => {
    if (type === 'call') {
      if (lead.phone) window.location.href = `tel:${lead.phone}`;
      else openDrawer(lead, 'activities');
    } else if (type === 'email') {
      if (lead.email) window.location.href = `mailto:${lead.email}`;
      else openDrawer(lead, 'activities');
    } else if (type === 'meeting') {
      openDrawer(lead, 'activities');
    } else if (type === 'note') {
      openDrawer(lead, 'notes');
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (search) {
        const term = search.toLowerCase();
        const matchesSearch =
          (l.firstName || '').toLowerCase().includes(term) ||
          (l.lastName || '').toLowerCase().includes(term) ||
          (l.fullName || '').toLowerCase().includes(term) ||
          (l.email || '').toLowerCase().includes(term) ||
          (l.company || '').toLowerCase().includes(term) ||
          (l.phone || '').toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }

      if (statusFilter) {
        if (['Hot', 'Warm', 'Cold'].includes(statusFilter)) {
          const priority = l.priority ? String(l.priority).toUpperCase() : 'COLD';
          if (priority !== statusFilter.toUpperCase()) return false;
        } else {
          if (l.status !== statusFilter) return false;
        }
      }

      if (kpiFilter) {
        if (l.status !== kpiFilter) return false;
      }

      if (sourceFilter && l.source !== sourceFilter) return false;

      if (ownerFilter && !(l.assignedToName || l.owner || '').toLowerCase().includes(ownerFilter.toLowerCase())) return false;

      if (dateFrom && new Date(l.createdAt) < new Date(dateFrom)) return false;
      if (dateTo && new Date(l.createdAt) > new Date(dateTo)) return false;
      return true;
    });
  }, [leads, search, statusFilter, sourceFilter, ownerFilter, dateFrom, dateTo, kpiFilter]);

  const miniStats = useMemo(() => {
    const stats = { New: 0, Contacted: 0, Meeting: 0, ProposalSent: 0, Converted: 0 };
    for (const l of leads) {
      if (l.status === 'NEW') stats.New++;
      else if (l.status === 'CONTACTED') stats.Contacted++;
      else if (l.status === 'MEETING') stats.Meeting++;
      else if (l.status === 'PROPOSAL_SENT') stats.ProposalSent++;
      else if (l.status === 'WON') stats.Converted++;
    }
    return stats;
  }, [leads]);

  return (
    <div>
      <PageHeader
        title={type === 'converted' ? 'Converted Leads' : type === 'lost' ? 'Lost Leads' : 'Lead Management'}
        subtitle="Track and manage your sales leads"
        search={search}
        onSearch={setSearch}
        actionContent={
          type === 'active' ? (
            <SplitButton
              primaryLabel="Add Lead"
              primaryIcon={Plus}
              onPrimaryClick={openCreate}
              options={[
                { label: 'Import Leads', icon: Download, onClick: () => setImportOpen(true) },
                { label: 'Export Leads', icon: Upload, onClick: () => setExportOpen(true) },
                { label: 'Templates', icon: FileText, onClick: () => setTemplatesOpen(true) }
              ]}
            />
          ) : undefined
        }
        filters={
          <>
            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                ...LEAD_STATUSES,
                { value: 'Hot', label: 'Hot' },
                { value: 'Warm', label: 'Warm' },
                { value: 'Cold', label: 'Cold' }
              ]}
              label="All Statuses"
            />
            <FilterSelect value={sourceFilter} onChange={setSourceFilter}
              options={LEAD_SOURCES.map((s) => ({ value: s, label: s }))} label="All Sources" />
          </>
        }
      />

      {loading ? (
        <LoadingSpinner />
      ) : leads.length === 0 ? (
        <EmptyState icon={Target} title="No leads found" description="Start by adding your first lead" action={<Button onClick={openCreate}>Add Lead</Button>} />
      ) : (
        <>
          <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 mb-6">
            <div className="flex-1 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  {
                    id: 'NEW',
                    title: 'New Leads',
                    count: miniStats.New,
                    trend: '+2 this week',
                    icon: User,
                    borderClass: 'border-l-4 border-blue-500',
                    iconBgClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
                  },
                  {
                    id: 'CONTACTED',
                    title: 'Contacted',
                    count: miniStats.Contacted,
                    trend: '+1 today',
                    icon: Phone,
                    borderClass: 'border-l-4 border-orange-500',
                    iconBgClass: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
                  },
                  {
                    id: 'MEETING',
                    title: 'Meetings',
                    count: miniStats.Meeting,
                    trend: miniStats.Meeting === 0 ? 'No meetings' : `Meeting${miniStats.Meeting > 1 ? 's' : ''}`,
                    icon: Calendar,
                    borderClass: 'border-l-4 border-purple-500',
                    iconBgClass: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
                  },
                  {
                    id: 'PROPOSAL_SENT',
                    title: 'Proposal Sent',
                    count: miniStats.ProposalSent,
                    trend: miniStats.ProposalSent === 0 ? 'No proposals' : `Proposal${miniStats.ProposalSent > 1 ? 's' : ''} sent`,
                    icon: FileText,
                    borderClass: 'border-l-4 border-indigo-500',
                    iconBgClass: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
                  },
                  {
                    id: 'WON',
                    title: 'Converted',
                    count: miniStats.Converted,
                    trend: miniStats.Converted > 0 ? `${Math.round((miniStats.Converted / leads.length) * 100)}% conversion rate` : '0% conversion rate',
                    icon: CheckCircle,
                    borderClass: 'border-l-4 border-emerald-500',
                    iconBgClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
                  }
                ].map((kpi) => {
                  const Icon = kpi.icon;
                  const isSelected = kpiFilter === kpi.id;
                  return (
                    <div
                      key={kpi.id}
                      onClick={() => setKpiFilter(isSelected ? '' : kpi.id)}
                      className={`relative overflow-hidden cursor-pointer rounded-2xl p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] ${kpi.borderClass} ${isSelected ? 'ring-2 ring-slate-300 dark:ring-slate-600' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{kpi.title}</p>
                        <div className={`p-2 rounded-xl ${kpi.iconBgClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{kpi.count}</p>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-500">{kpi.trend}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <Input label="Owner" placeholder="Filter by assigned user" value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)} />
            <div className="flex gap-2 items-end">
              <Input label="From" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              <Input label="To" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
                <button className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`} onClick={() => setViewMode('list')} title="List View">
                  <List className="w-5 h-5" />
                </button>
                <button className={`p-2 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`} onClick={() => setViewMode('kanban')} title="Kanban View">
                  <LayoutGrid className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="grid gap-4">
              {filteredLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} onOpen={openDrawer} onConvert={openConversionModal} onShowBookedDetails={setBookedDetailsLead} onQuickAction={handleQuickAction} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {['NEW', 'CONTACTED', 'MEETING', 'PROPOSAL_SENT', 'WON'].map((col) => {
                const label = LEAD_STATUSES.find(s => s.value === col)?.label || col;
                return (
                  <div key={col} className="space-y-3 min-w-0">
                    <h4 className="font-semibold text-sm uppercase tracking-wide text-slate-600 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-700">{label}</h4>
                    <div className="space-y-3">
                      {filteredLeads.filter(l => l.status === col).map(l => (
                        <LeadCard key={l.id} lead={l} vertical={true} onOpen={openDrawer} onConvert={openConversionModal} onShowBookedDetails={setBookedDetailsLead} onQuickAction={handleQuickAction} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Lead' : 'Add Lead'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
          <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Select label="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
            options={LEAD_SOURCES.map((s) => ({ value: s, label: s }))} />
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={LEAD_STATUSES} disabled={editing?.status === 'WON'} />
          <Select label="Priority" value={form.priority || 'COLD'} onChange={(e) => setForm({ ...form, priority: e.target.value })}
            options={[{ value: 'COLD', label: 'Cold' }, { value: 'WARM', label: 'Warm' }, { value: 'HOT', label: 'Hot' }]} />
          <Input label={<span>Company <span className="text-xs text-slate-400 font-normal">(Optional)</span></span>} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        </div>
        <div className="mt-4">
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>{editing ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>
      <LeadDetailsPanel
        isOpen={drawerOpen}
        onClose={closeDrawer}
        lead={selectedLead}
        onUpdate={(data) => handleUpdateLead(selectedLead.id, data)}
        onConvert={(lead) => openConversionModal(lead)}
        initialTab={drawerTab}
      />

      <LeadConversionModal
        isOpen={conversionModalOpen}
        onClose={() => setConversionModalOpen(false)}
        lead={leadToConvert}
        onConvert={handleConvertAction}
        onLost={handleLostAction}
        onUpdateStatus={handleUpdateStatusAction}
        loading={saving}
      />

      <ImportLeads
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        leads={leads}
        onImportComplete={() => { refreshLeads(); setImportOpen(false); }}
        createLead={(data) => leadsApi.create(data)}
      />

      <ExportLeads
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        leads={leads}
        filteredLeads={filteredLeads}
        selectedLeadIds={[]}
      />

      <Templates
        isOpen={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
      />

      <Modal
        isOpen={!!bookedDetailsLead}
        onClose={() => setBookedDetailsLead(null)}
        title="Booking Details"
        size="md"
      >
        {bookedDetailsLead && (
          <div className="space-y-6">
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${bookedDetailsLead.status === 'WON'
                  ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                }`}>
                {bookedDetailsLead.status === 'WON' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {bookedDetailsLead.fullName || `${bookedDetailsLead.firstName} ${bookedDetailsLead.lastName}`}
                </h3>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded-full text-xs font-semibold ${bookedDetailsLead.status === 'WON'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                  {bookedDetailsLead.status === 'WON' ? 'BOOKED' : 'LOST'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Booking Status</label>
                  <select
                    value={bookedDetailsLead.status === 'WON' ? 'WON' : 'LOST'}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none transition-all cursor-pointer ${bookedDetailsLead.status === 'WON'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400'
                        : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400'
                      }`}
                  >
                    <option value="WON" className="bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-semibold">Booked</option>
                    <option value="LOST" className="bg-white dark:bg-slate-800 text-red-700 dark:text-red-400 font-semibold">Lost</option>
                  </select>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Lead Owner</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                    {bookedDetailsLead.owner || bookedDetailsLead.assignedToName || 'Unassigned'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes</p>
                <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {bookedDetailsLead.notes || <span className="italic text-slate-400">No notes available for this lead.</span>}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button onClick={() => setBookedDetailsLead(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-white font-medium animate-toast-in ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.type === 'error' ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
