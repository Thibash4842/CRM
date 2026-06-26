import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leadsApi } from '../services/api';
import { useLeadsContext } from '../context/LeadContext';
import PageHeader, { LoadingSpinner } from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { LEAD_STATUSES, LEAD_SOURCES, formatDateTime, getStatusBadge } from '../utils/constants';
import { Phone, Mail, Calendar, FileText, CheckCircle, Clock, XCircle, ArrowRight, User, Star, Copy, Activity } from 'lucide-react';

const MOCK_TIMELINE = [
  { id: 1, type: 'note', text: 'Added a note: Discussed pricing, they are very interested in the premium tier.', user: 'You', date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 2, type: 'status', text: 'Changed status from NEW to CONTACTED', user: 'You', date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: 3, type: 'call', text: 'Completed a 15-minute discovery call', user: 'You', date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: 4, type: 'create', text: 'Lead was created', user: 'System', date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() }
];



const INDUSTRY_OPTIONS = [
  { value: '', label: 'Select Industry...' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Education', label: 'Education' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'IT Services', label: 'IT Services' },
  { value: 'Others', label: 'Others' }
];

const NEXT_ACTION_OPTIONS = [
  { value: '', label: 'Select Next Action...' },
  { value: 'Demo Scheduled', label: 'Demo Scheduled' },
  { value: 'Follow-up Required', label: 'Follow-up Required' },
  { value: 'Call Back', label: 'Call Back' },
  { value: 'Meeting Booked', label: 'Meeting Booked' },
  { value: 'Proposal Sent', label: 'Proposal Sent' }
];

const TEAM_MEMBERS = [
  { value: 'You', label: 'You' },
  { value: 'John Smith', label: 'John Smith' },
  { value: 'Sarah Jane', label: 'Sarah Jane' },
  { value: 'Michael Scott', label: 'Michael Scott' },
  { value: 'Unassigned', label: 'Unassigned' }
];

const PRIORITY_OPTIONS = [
  { value: 'COLD', label: 'Cold' },
  { value: 'WARM', label: 'Warm' },
  { value: 'HOT', label: 'Hot' }
];

function TimelineIcon({ type }) {
  if (type === 'note') return <FileText className="w-4 h-4 text-purple-600" />;
  if (type === 'call') return <Phone className="w-4 h-4 text-emerald-600" />;
  if (type === 'email') return <Mail className="w-4 h-4 text-sky-600" />;
  if (type === 'meeting') return <Calendar className="w-4 h-4 text-orange-600" />;
  if (type === 'status') return <Activity className="w-4 h-4 text-indigo-600" />;
  return <CheckCircle className="w-4 h-4 text-slate-600" />;
}

function PriorityBadge({ priority }) {
  const p = priority ? String(priority).toUpperCase() : 'COLD';
  let label = 'Cold';
  let color = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  if (p === 'HOT') { label = 'Hot'; color = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'; }
  else if (p === 'WARM') { label = 'Warm'; color = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'; }
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${color}`}>
      <Star className="w-3.5 h-3.5" /> {label}
    </div>
  );
}

function StatusBadge({ status }) {
  const badge = getStatusBadge(status, LEAD_STATUSES);
  if (status === 'WON') return <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"><CheckCircle className="w-3.5 h-3.5" /> Booked</div>;
  if (status === 'LOST') return <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><XCircle className="w-3.5 h-3.5" /> Lost</div>;
  if (status === 'FOLLOW_UP') return <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"><Clock className="w-3.5 h-3.5" /> Follow Up</div>;
  if (status === 'DUPLICATE') return <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400"><Copy className="w-3.5 h-3.5" /> Duplicate</div>;

  return <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-white ${badge.color}`}>{badge.label}</div>;
}

export default function LeadEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateLeadState } = useLeadsContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lead, setLead] = useState(null);

  const [fieldHistory, setFieldHistory] = useState([]);
  const formTracker = useRef({ status: null, priority: null, owner: null });

  const [timeline, setTimeline] = useState(MOCK_TIMELINE);
  const [activeModal, setActiveModal] = useState(null);
  const [actionForm, setActionForm] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', additionalPhone: '', location: '',
    company: '', industry: '', companyWebsite: '',
    source: 'Website', status: 'NEW', priority: 'COLD', owner: 'You',
    notes: '', followUpDate: '', nextAction: '', internalComments: ''
  });

  useEffect(() => {
    const fetchLead = async () => {
      try {
        setLoading(true);
        let foundLead;
        if (leadsApi.getById) {
          foundLead = await leadsApi.getById(id);
        } else {
          const leads = await leadsApi.getAll({});
          foundLead = leads.find((l) => String(l.id) === String(id));
        }

        if (foundLead) {
          setLead(foundLead);
          const initialData = {
            firstName: foundLead.firstName || '',
            lastName: foundLead.lastName || '',
            email: foundLead.email || '',
            phone: foundLead.phone || '',
            additionalPhone: foundLead.additionalPhone || '',
            location: foundLead.location || '',
            company: foundLead.company || '',

            industry: foundLead.industry || '',
            companyWebsite: foundLead.companyWebsite || '',
            source: foundLead.source || 'Website',
            status: foundLead.status || 'NEW',
            priority: foundLead.priority || 'COLD',
            owner: foundLead.owner || 'You',
            notes: foundLead.notes || '',
            followUpDate: foundLead.followUpDate || '',
            nextAction: foundLead.nextAction || '',
            internalComments: foundLead.internalComments || ''
          };
          setForm(initialData);
        }
      } catch (err) {
        console.error('Error fetching lead:', err);
        showToast(err.message || 'Failed to load lead details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [id]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const updatedBackendLead = await leadsApi.update(id, form);
      // Fallback merge prioritizing the form values to ensure UI updates instantly even if backend drops some fields
      const mergedLead = { ...lead, ...(updatedBackendLead || {}), ...form, updatedAt: new Date().toISOString() };
      updateLeadState(id, mergedLead);

      // Add activity timeline entry
      setTimeline(prev => [{
        id: Date.now(),
        type: 'status',
        text: 'Lead updated',
        user: 'You',
        date: new Date().toISOString()
      }, ...prev]);

      showToast('Lead updated successfully!');
      setTimeout(() => navigate(-1), 1000);
    } catch (err) {
      showToast(err.message || 'Failed to update lead', 'error');
    } finally {
      setSaving(false);
    }
  }, [id, form, navigate, lead, updateLeadState]);

  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleActionSubmit = async (type) => {
    setActionLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let timelineEntry = { id: Date.now(), date: new Date().toISOString(), user: 'You' };
    switch (type) {
      case 'call':
        timelineEntry = { ...timelineEntry, type: 'call', text: `Logged call (${actionForm.outcome || 'Answered'})${actionForm.notes ? `: ${actionForm.notes}` : ''}` };
        break;
      case 'email':
        timelineEntry = { ...timelineEntry, type: 'email', text: `Sent email: ${actionForm.subject || 'No subject'}` };
        break;
      case 'meeting':
        timelineEntry = { ...timelineEntry, type: 'meeting', text: `Scheduled meeting: ${actionForm.title || 'Sync'} on ${actionForm.date || ''}` };
        break;
      case 'note':
        timelineEntry = { ...timelineEntry, type: 'note', text: `Added note: ${actionForm.title || ''} - ${actionForm.notes || ''}` };
        break;
    }
    setTimeline(prev => [timelineEntry, ...prev]);
    showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} logged successfully!`);
    setActiveModal(null);
    setActionForm({});
    setActionLoading(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        // Only navigate away if no quick-action modal is open
        if (!activeModal) {
          e.preventDefault();
          handleCancel();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleCancel, activeModal]);

  useEffect(() => {
    if (!lead) return;
    
    if (formTracker.current.status === null) {
      formTracker.current = { status: lead.status || 'NEW', priority: lead.priority || 'COLD', owner: lead.owner || 'Unassigned' };
      
      const getStatusLabel = (val) => LEAD_STATUSES.find(s=>s.value===val)?.label || val;
      const getPriorityLabel = (val) => PRIORITY_OPTIONS.find(p=>p.value===val)?.label || val;
      
      const initialHistory = [
        { id: 1, field: 'Status', from: lead.status === 'NEW' ? 'System' : 'New', to: getStatusLabel(lead.status || 'NEW'), date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
        { id: 2, field: 'Priority', from: lead.priority === 'COLD' ? 'System' : 'Cold', to: getPriorityLabel(lead.priority || 'COLD'), date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
        { id: 3, field: 'Owner', from: (!lead.owner || lead.owner === 'Unassigned') ? 'System' : 'Unassigned', to: lead.owner || 'Unassigned', date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() }
      ];
      setFieldHistory(initialHistory);
      return;
    }

    const newHistory = [];
    const getStatusLabel = (val) => LEAD_STATUSES.find(s=>s.value===val)?.label || val;
    const getPriorityLabel = (val) => PRIORITY_OPTIONS.find(p=>p.value===val)?.label || val;

    if (form.status !== formTracker.current.status) {
      newHistory.push({
         id: Date.now() + 1,
         field: 'Status',
         from: getStatusLabel(formTracker.current.status),
         to: getStatusLabel(form.status),
         date: new Date().toISOString()
      });
      formTracker.current.status = form.status;
    }

    if (form.priority !== formTracker.current.priority) {
      newHistory.push({
         id: Date.now() + 2,
         field: 'Priority',
         from: getPriorityLabel(formTracker.current.priority),
         to: getPriorityLabel(form.priority),
         date: new Date().toISOString()
      });
      formTracker.current.priority = form.priority;
    }

    if (form.owner !== formTracker.current.owner) {
      newHistory.push({
         id: Date.now() + 3,
         field: 'Owner',
         from: formTracker.current.owner || 'Unassigned',
         to: form.owner || 'Unassigned',
         date: new Date().toISOString()
      });
      formTracker.current.owner = form.owner;
    }

    if (newHistory.length > 0) {
      setFieldHistory(prev => [...newHistory, ...prev]);
    }
  }, [form.status, form.priority, form.owner, lead]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-8 text-center text-slate-500">
        Lead not found.
      </div>
    );
  }

  const fullName = lead.fullName || `${form.firstName} ${form.lastName}`.trim();
  const lastUpdated = lead.updatedAt || lead.createdAt || new Date().toISOString();

  return (
    <div className="pb-24">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-white font-medium animate-slide-in-right ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.type === 'error' ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{fullName}</h1>
            <div className="flex gap-2">
              <StatusBadge status={form.status} />
              <PriorityBadge priority={form.priority} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1.5"><User className="w-4 h-4" /> Owner: <span className="font-medium text-slate-700 dark:text-slate-300">{form.owner}</span></div>
            {/* <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500" /> Score: <span className="font-medium text-slate-700 dark:text-slate-300">{form.score}</span></div> */}
            <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Updated: {formatDateTime(lastUpdated)}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setActiveModal('call'); setActionForm({}); }} className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 text-slate-600 dark:text-slate-300 transition-all hover:scale-105 hover:shadow-sm" title="Call">
            <Phone className="w-4 h-4" />
            <span className="absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Log Call</span>
          </button>
          <button onClick={() => { setActiveModal('email'); setActionForm({ to: form.email }); }} className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 text-slate-600 dark:text-slate-300 transition-all hover:scale-105 hover:shadow-sm" title="Email">
            <Mail className="w-4 h-4" />
            <span className="absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Send Email</span>
          </button>
          <button onClick={() => { setActiveModal('meeting'); setActionForm({}); }} className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 dark:hover:bg-orange-900/30 dark:hover:text-orange-400 text-slate-600 dark:text-slate-300 transition-all hover:scale-105 hover:shadow-sm" title="Meeting">
            <Calendar className="w-4 h-4" />
            <span className="absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Schedule Meeting</span>
          </button>
          <button onClick={() => { setActiveModal('note'); setActionForm({}); }} className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 dark:hover:bg-purple-900/30 dark:hover:text-purple-400 text-slate-600 dark:text-slate-300 transition-all hover:scale-105 hover:shadow-sm" title="Note">
            <FileText className="w-4 h-4" />
            <span className="absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Add Note</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Form Sections */}
        <div className="flex-1 space-y-6">

          {/* 1. Contact Information */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">1. Contact Information</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input label={<span>Additional Phone <span className="text-xs text-slate-400 font-normal">(Optional)</span></span>} value={form.additionalPhone} onChange={(e) => setForm({ ...form, additionalPhone: e.target.value })} />
              <Input label={<span>Location <span className="text-xs text-slate-400 font-normal">(Optional)</span></span>} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
          </div>

          {/* 2. Company Information */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">2. Company Information</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label={<span>Company <span className="text-xs text-slate-400 font-normal">(Optional)</span></span>} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />

              <Select label="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} options={INDUSTRY_OPTIONS} />
              <Input label="Company Website" value={form.companyWebsite} onChange={(e) => setForm({ ...form, companyWebsite: e.target.value })} />
            </div>
          </div>

          {/* 3. Lead Details */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">3. Lead Details</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Select label="Lead Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={LEAD_STATUSES} disabled={lead?.status === 'WON'} />
              <Select label="Lead Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} options={LEAD_SOURCES.map(s => ({ value: s, label: s }))} />
              <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} options={PRIORITY_OPTIONS} />
              <Input label="Assigned To (Owner)" value={form.owner || ''} placeholder="e.g. John Smith" onChange={(e) => setForm({ ...form, owner: e.target.value })} />
            </div>
          </div>

          {/* 4. Activities & Notes */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">4. Activities & Notes</h3>
            </div>
            <div className="p-6 space-y-5">
              <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input label="Follow-up Date" type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} />
                <Select label="Next Action" value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })} options={NEXT_ACTION_OPTIONS} />
              </div>
              <Textarea label={<span>Internal Comments <span className="text-xs text-slate-400 font-normal">(Optional)</span></span>} value={form.internalComments} onChange={(e) => setForm({ ...form, internalComments: e.target.value })} rows={2} />
            </div>
          </div>
        </div>

        {/* Right Column - Timeline & History */}
        <div className="w-full lg:w-96 shrink-0 space-y-6">

          {/* Activity Timeline */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Activity Timeline</h3>
            </div>
            <div className="p-6">
              <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-8">
                {timeline.map((item, index) => (
                  <div key={item.id} className="relative pl-6">
                    <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-slate-50 dark:bg-slate-900 border-2 border-white dark:border-slate-950 flex items-center justify-center">
                      <TimelineIcon type={item.type} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{item.text}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 font-medium">
                        <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{item.user}</span>
                        <span>{formatDateTime(item.date)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Field History */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Field History</h3>
            </div>
            <div className="p-6 space-y-5">
              {fieldHistory.map((hist) => (
                <div key={hist.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{hist.field}</span>
                    <span className="text-[10px] text-slate-400">{formatDateTime(hist.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500 line-through decoration-slate-300 dark:decoration-slate-600">{hist.from}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{hist.to}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <Modal isOpen={activeModal === 'call'} onClose={() => setActiveModal(null)} title="Log a Call">
        <div className="space-y-4">
          <Select label="Call Outcome" value={actionForm.outcome || 'Answered'} onChange={e => setActionForm({...actionForm, outcome: e.target.value})} options={[{value:'Answered', label:'Answered'}, {value:'No Answer', label:'No Answer'}, {value:'Busy', label:'Busy'}, {value:'Voicemail', label:'Left Voicemail'}]} />
          <Input label="Duration (e.g., 5 min)" value={actionForm.duration || ''} onChange={e => setActionForm({...actionForm, duration: e.target.value})} />
          <Textarea label="Notes" value={actionForm.notes || ''} onChange={e => setActionForm({...actionForm, notes: e.target.value})} rows={3} />
          <Input type="date" label="Follow-up Date (Optional)" value={actionForm.followUp || ''} onChange={e => setActionForm({...actionForm, followUp: e.target.value})} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setActiveModal(null)}>Cancel</Button>
          <Button onClick={() => handleActionSubmit('call')} loading={actionLoading}>Log Call</Button>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'email'} onClose={() => setActiveModal(null)} title="Compose Email">
        <div className="space-y-4">
          <Input label="To" value={actionForm.to || ''} onChange={e => setActionForm({...actionForm, to: e.target.value})} />
          <Input label="Subject" value={actionForm.subject || ''} onChange={e => setActionForm({...actionForm, subject: e.target.value})} />
          <Textarea label="Message" rows={4} value={actionForm.message || ''} onChange={e => setActionForm({...actionForm, message: e.target.value})} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setActiveModal(null)}>Cancel</Button>
          <Button onClick={() => handleActionSubmit('email')} loading={actionLoading}>Send Email</Button>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'meeting'} onClose={() => setActiveModal(null)} title="Schedule Meeting">
        <div className="space-y-4">
          <Input label="Title" value={actionForm.title || ''} onChange={e => setActionForm({...actionForm, title: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input type="date" label="Date" value={actionForm.date || ''} onChange={e => setActionForm({...actionForm, date: e.target.value})} />
            <Input type="time" label="Time" value={actionForm.time || ''} onChange={e => setActionForm({...actionForm, time: e.target.value})} />
          </div>
          <Select label="Meeting Type" value={actionForm.type || 'Online'} onChange={e => setActionForm({...actionForm, type: e.target.value})} options={[{value:'Online', label:'Online'}, {value:'Offline', label:'In Person'}]} />
          <Textarea label="Description" rows={3} value={actionForm.description || ''} onChange={e => setActionForm({...actionForm, description: e.target.value})} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setActiveModal(null)}>Cancel</Button>
          <Button onClick={() => handleActionSubmit('meeting')} loading={actionLoading}>Schedule Meeting</Button>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'note'} onClose={() => setActiveModal(null)} title="Add Note">
        <div className="space-y-4">
          <Input label="Title" value={actionForm.title || ''} onChange={e => setActionForm({...actionForm, title: e.target.value})} />
          <Textarea label="Notes" rows={4} value={actionForm.notes || ''} onChange={e => setActionForm({...actionForm, notes: e.target.value})} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setActiveModal(null)}>Cancel</Button>
          <Button onClick={() => handleActionSubmit('note')} loading={actionLoading}>Save Note</Button>
        </div>
      </Modal>

      {/* Floating Save Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-40">
        <div className="w-full flex flex-wrap items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="text-sm text-slate-500 hidden sm:block pl-[20vw]">
            <span className="font-medium text-slate-700 dark:text-slate-300">Pro tip:</span> Press <kbd className="px-1.5 py-0.5 border rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs">Ctrl+Enter</kbd> to save, <kbd className="px-1.5 py-0.5 border rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs">Esc</kbd> to cancel
          </div>
          <div className="flex justify-end gap-3 w-full sm:w-auto">
            <Button variant="secondary" onClick={handleCancel} disabled={saving} className="px-6">Cancel</Button>
            <Button onClick={handleSave} loading={saving} className="px-8 shadow-md">Save Lead</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
