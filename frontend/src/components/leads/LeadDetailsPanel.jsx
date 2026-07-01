import { Mail, Phone, MapPin, Building2, Globe, Calendar, Clock, Edit, MoreHorizontal, Video, MessageCircle, Briefcase, Activity, FileText, CheckSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import CallModal from '../activities/CallModal';
import TaskModal from '../activities/TaskModal';
import { useNavigate } from 'react-router-dom';
import Drawer from '../ui/Drawer';
import ContactTimeline from '../contacts/ContactTimeline';

const AVATAR_COLORS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-indigo-500 to-blue-600',
];

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const TABS = [
  { id: 'overview', label: 'Lead Overview', icon: Activity },
  { id: 'activities', label: 'Activities', icon: Phone },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'followups', label: 'Follow-ups', icon: CheckSquare },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'related', label: 'Related Records', icon: Briefcase },
];

const MOCK_CALLS = [
  { id: 1, type: 'outbound', duration: '18 min', time: 'Today, 10:30 AM', notes: 'Discussed enterprise features and pricing. Contact showed strong interest in analytics module.', outcome: 'Interested' },
  { id: 2, type: 'inbound', duration: '5 min', time: 'Yesterday, 3:15 PM', notes: 'Quick call about integration capabilities.', outcome: 'Follow-up needed' },
];

const MOCK_NOTES = [
  { id: 1, content: 'Decision maker confirmed. Budget approved for Q3. Need to send updated proposal by EOW.', author: 'You', time: 'Today, 11:00 AM' },
];

const MOCK_TASKS = [
  { id: 1, title: 'Send updated proposal', due: 'Tomorrow', priority: 'high', done: false },
  { id: 2, title: 'Schedule demo with tech team', due: 'Thu, 22 Jun', priority: 'medium', done: false },
];

export default function LeadDetailsPanel({ isOpen, onClose, lead, onUpdate, onConvert, initialTab = 'overview' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab, lead?.id]);

  if (!lead) return null;

  const fullName = lead.fullName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unknown Lead';
  const avatarColor = getAvatarColor(fullName);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Lead Details" size="xl" noPadding hideHeader={true}>
      <div className="flex items-center justify-between p-6 dark:border-slate-700/50 shrink-0 absolute top-0 left-0 right-0 z-30 pointer-events-none">
        <h3 className="text-lg font-semibold pointer-events-auto opacity-0">Lead Details</h3>
        <button onClick={onClose} className="p-2 pt-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 pointer-events-auto backdrop-blur-sm transition-all cursor-pointer">
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div className="flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden">
        {/* ═══ Header Section ═══ */}
        <div className="flex-shrink-0 relative z-20">
          {/* Subtle Background Accent */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-t-xl z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-900/50 dark:to-slate-950" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          </div>

          <div className="relative z-10 px-8 pt-8 pb-5 dark:border-slate-800/60">
            <div className="flex items-start gap-6 pr-12">
              {/* Avatar */}
              <div className="relative flex-shrink-0 mt-1">
                <div className={`w-[72px] h-[72px] rounded-2xl bg-gradient-to-br ${avatarColor} text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-indigo-500/20 ring-4 ring-white dark:ring-slate-950 z-10 relative`}>
                  {fullName[0]?.toUpperCase() || '?'}
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-emerald-500 border-[3px] border-white dark:border-slate-950 rounded-full z-20 shadow-sm" />
              </div>

              {/* Name + Meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">{fullName}</h1>
                  <span className={`flex-shrink-0 inline-flex items-center h-5 px-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${lead.status === 'WON' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' :
                    lead.status === 'LOST' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/30' :
                      'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30'
                    }`}>
                    {lead.status || 'NEW'}
                  </span>
                </div>

                {/* Meta details row */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 text-[13px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    {lead.jobTitle || 'Lead'} at <span className="font-semibold text-slate-800 dark:text-slate-200">{lead.company || 'Unknown Company'}</span>
                  </span>

                  {lead.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {lead.email}
                    </span>
                  )}

                  {lead.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {lead.phone}
                    </span>
                  )}

                  {/* Owner badge */}
                  <span className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                    <div className="w-5 h-5 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-700">
                      {(lead.owner || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-slate-500 dark:text-slate-400">Owner: <span className="font-semibold text-slate-700 dark:text-slate-300">{lead.owner || 'Unassigned'}</span></span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => navigate(`/leads/edit/${lead.id}`)} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <Edit className="w-3.5 h-3.5" /> Edit Lead
                </button>
                <div className="relative">
                  <button onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {isMoreMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-20">
                      <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" onClick={() => { setIsMoreMenuOpen(false); alert('Duplicate Lead clicked'); }}>Duplicate Lead</button>
                      <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" onClick={() => { setIsMoreMenuOpen(false); alert('Assign Owner clicked'); }}>Assign Owner</button>
                      <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" onClick={() => { setIsMoreMenuOpen(false); alert('Copy Link clicked'); }}>Copy Link</button>
                      <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" onClick={() => { setIsMoreMenuOpen(false); alert('Export clicked'); }}>Export</button>
                      <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" onClick={() => { setIsMoreMenuOpen(false); alert('Archive clicked'); }}>Archive</button>
                      <div className="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
                      <button className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium" onClick={() => { setIsMoreMenuOpen(false); if (window.confirm('Are you sure you want to delete this lead?')) { alert('Lead deleted'); onClose(); } }}>Delete Lead</button>
                    </div>
                  )}
                </div>
                {lead.status !== 'WON' && (
                  <button onClick={() => { onConvert(lead); onClose(); }} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm shadow-indigo-500/20 transition-all">
                    <Activity className="w-3.5 h-3.5" /> Convert Lead
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="px-6 pb-4 relative z-1">
            <div className="grid grid-cols-4 gap-2">
              {[
                {
                  icon: Phone, label: 'Call', color: 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 ring-1 ring-inset ring-emerald-200 dark:ring-emerald-800',
                  action: () => lead.phone ? window.open(`tel:${lead.phone}`, '_self') : alert('No phone number available for this lead.')
                },
                {
                  icon: Mail, label: 'Email', color: 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 ring-1 ring-inset ring-blue-200 dark:ring-blue-800',
                  action: () => lead.email ? window.open(`mailto:${lead.email}`, '_self') : alert('No email available for this lead.')
                },
                {
                  icon: Video, label: 'Schedule Meeting', color: 'text-purple-700 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 ring-1 ring-inset ring-purple-200 dark:ring-purple-800',
                  action: () => navigate('/calendar')
                },
                {
                  icon: MessageCircle, label: 'WhatsApp', color: 'text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 ring-1 ring-inset ring-green-200 dark:ring-green-800',
                  action: () => lead.phone ? window.open(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`, '_blank') : alert('No phone number available for this lead.')
                },
              ].map(action => {
                const Icon = action.icon;
                return (
                  <button key={action.label} onClick={action.action} className={`flex items-center justify-center gap-2 h-10 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 ${action.color}`}>
                    <Icon className="w-4 h-4" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 flex gap-2 overflow-x-auto scrollbar-hide py-2">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-bold whitespace-nowrap transition-all duration-200 rounded-full ${isActive
                    ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400 dark:text-indigo-600' : ''}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ Tab Content ═══ */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab lead={lead} fullName={fullName} />}
            {activeTab === 'activities' && <ActivitiesTab leadId={lead.id} />}
            {activeTab === 'notes' && <NotesTab leadId={lead.id} />}
            {activeTab === 'followups' && <TasksTab leadId={lead.id} />}
            {activeTab === 'timeline' && <ContactTimeline leadId={lead.id} />}
            {activeTab === 'related' && <RelatedTab leadId={lead.id} />}
          </div>
        </div>
      </div>
    </Drawer >
  );
}

function OverviewTab({ lead, fullName }) {
  return (
    <div className="space-y-5">
      {/* Info Cards Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 shadow-sm shadow-slate-200/50 dark:shadow-none overflow-hidden transition-shadow hover:shadow-md hover:shadow-slate-200/50">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
            <h3 className="text-[13px] font-bold tracking-wide text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-1 h-3.5 bg-indigo-500 rounded-full"></span>
              Contact Information
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <InfoRow icon={Mail} label="Email" value={lead.email} isLink />
            <InfoRow icon={Phone} label="Phone" value={lead.phone} />
            <InfoRow icon={MapPin} label="Location" value={[lead.city, lead.state, lead.country].filter(Boolean).join(', ')} />
          </div>
        </div>

        {/* Company Information */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 shadow-sm shadow-slate-200/50 dark:shadow-none overflow-hidden transition-shadow hover:shadow-md hover:shadow-slate-200/50">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
            <h3 className="text-[13px] font-bold tracking-wide text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-1 h-3.5 bg-emerald-500 rounded-full"></span>
              Company Information
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <InfoRow icon={Building2} label="Company" value={lead.company} />
            <InfoRow icon={Globe} label="Website" value={lead.website} isLink />
            <InfoRow icon={Briefcase} label="Industry" value={lead.industry} />
          </div>
        </div>

        {/* Social Information */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 shadow-sm shadow-slate-200/50 dark:shadow-none overflow-hidden transition-shadow hover:shadow-md hover:shadow-slate-200/50">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
            <h3 className="text-[13px] font-bold tracking-wide text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-1 h-3.5 bg-blue-500 rounded-full"></span>
              Social Profiles
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <InfoRow icon={Globe} label="LinkedIn" value="linkedin.com/in/lead" isLink />
            <InfoRow icon={Globe} label="Twitter" value="@lead" />
            <InfoRow icon={Globe} label="Website" value={lead.website} isLink />
          </div>
        </div>

        {/* Lead Details */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 shadow-sm shadow-slate-200/50 dark:shadow-none overflow-hidden transition-shadow hover:shadow-md hover:shadow-slate-200/50">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
            <h3 className="text-[13px] font-bold tracking-wide text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-1 h-3.5 bg-rose-500 rounded-full"></span>
              Lead Details
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <InfoRow icon={Activity} label="Status" value={lead.status} />
            <InfoRow icon={Globe} label="Source" value={lead.source} />
            <InfoRow icon={Calendar} label="Created" value={new Date(lead.createdAt).toLocaleDateString()} />
          </div>
        </div>

        {/* Custom Fields */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 shadow-sm shadow-slate-200/50 dark:shadow-none overflow-hidden transition-shadow hover:shadow-md hover:shadow-slate-200/50">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
            <h3 className="text-[13px] font-bold tracking-wide text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-1 h-3.5 bg-amber-500 rounded-full"></span>
              Custom Fields
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <InfoRow icon={FileText} label="Industry Segment" value="Enterprise" />
            <InfoRow icon={MapPin} label="Territory" value="North America" />
            <InfoRow icon={Briefcase} label="Lead Score" value="85 / 100" />
          </div>
        </div>
      </div>

      {/* Notes section */}
      {lead.notes && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Notes</h3>
          </div>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{lead.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ActivitiesTab({ leadId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    import('../../services/api').then(({ activitiesApi }) => {
      activitiesApi.getForEntity('LEAD', leadId).then(data => {
        setActivities(data || []);
        setLoading(false);
      });
    });
  }, [leadId]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Recent Activities</h3>
        <button onClick={() => setIsCallModalOpen(true)} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors">
          <Phone className="w-3.5 h-3.5" /> Log Call
        </button>
      </div>
      {isCallModalOpen && (
        <CallModal
          isOpen={isCallModalOpen}
          onClose={() => setIsCallModalOpen(false)}
          onSave={async (data) => {
            try {
              const { activitiesApi } = await import('../../services/api');
              const newAct = await activitiesApi.create({ ...data, relatedEntity: 'LEAD', relatedId: leadId });
              setActivities(prev => [newAct, ...prev]);
              setIsCallModalOpen(false);
            } catch (e) { alert("Failed to log call"); }
          }}
        />
      )}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full border border-slate-200/50 dark:border-slate-800"></div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <p className="text-sm text-slate-500">No recent activities found.</p>
      ) : (
        activities.map(act => (
          <div key={act.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
                  <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 capitalize">{act.type.replace('_', ' ').toLowerCase()}</span>
                  <span className="text-xs text-slate-400 ml-2">· {act.createdBy?.name || 'System'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{new Date(act.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">{act.description}</p>
            {act.details && <p className="text-xs text-slate-400 mt-2 p-2 bg-slate-50 dark:bg-slate-900 rounded">{act.details}</p>}
          </div>
        ))
      )}
    </div>
  );
}

function NotesTab({ leadId }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [NoteModal, setNoteModal] = useState(null);

  useEffect(() => {
    setLoading(true);
    import('../../services/notesService').then(({ notesService }) => {
      notesService.getAll().then(data => {
        setNotes(data || []);
        setLoading(false);
      });
    });
    // Dynamically import NoteModal
    import('../notes/NoteModal').then(m => setNoteModal(() => m.default));
  }, []);

  const handleSaveNote = async (noteData) => {
    try {
      const { notesService } = await import('../../services/notesService');
      const newNote = await notesService.create({ ...noteData, linkedRecords: [{ id: leadId, type: 'Lead' }] });
      setNotes(prev => [newNote, ...prev]);
      setIsNoteModalOpen(false);
    } catch (err) {
      alert('Failed to save note');
      console.error(err);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Notes</h3>
        <button onClick={() => setIsNoteModalOpen(true)} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors">
          <FileText className="w-3.5 h-3.5" /> Add Note
        </button>
      </div>
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full border border-slate-200/50 dark:border-slate-800"></div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <p className="text-sm text-slate-500">No notes found.</p>
      ) : (
        notes.map(note => (
          <div key={note.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-2">{note.content}</p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-medium">{note.owner?.name || 'Unknown'}</span>
              <span>·</span>
              <span>{new Date(note.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ))
      )}
      {NoteModal && (
        <NoteModal
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          onSave={handleSaveNote}
        />
      )}
    </div>
  );
}

function TasksTab({ leadId }) {
  const [tasks, setTasks] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  useEffect(() => {
    import('../../services/api').then(({ tasksApi }) => {
      // Temporary workaround: fetch all and filter since tasksApi doesn't yet support relatedEntity filtering
      tasksApi.getAll().then(data => {
        const leadTasks = (data || []).filter(t => t.relatedEntityType === 'LEAD' && t.relatedEntityId === leadId);
        setTasks(leadTasks);
      });
    });
  }, [leadId]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Follow-ups</h3>
        <button onClick={() => setIsTaskModalOpen(true)} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors">
          <CheckSquare className="w-3.5 h-3.5" /> Add Follow-up
        </button>
      </div>
      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={async (data) => {
            try {
              const { tasksApi } = await import('../../services/api');
              const newTask = await tasksApi.create({ ...data, relatedEntityType: 'LEAD', relatedEntityId: leadId });
              setTasks(prev => [newTask, ...prev]);
              setIsTaskModalOpen(false);
            } catch (e) { alert("Failed to add follow-up"); }
          }}
        />
      )}
      {tasks.map(task => (
        <div key={task.id} className={`p-4 rounded-xl border bg-white dark:bg-slate-950 flex items-start gap-3 ${task.status === 'COMPLETED' ? 'border-slate-100 dark:border-slate-800/50 opacity-60' : 'border-slate-200 dark:border-slate-800'}`}>
          <button onClick={async () => {
            const newStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
            try {
              const { tasksApi } = await import('../../services/api');
              await tasksApi.update(task.id, { ...task, status: newStatus });
              setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
            } catch (e) { alert("Failed to update follow-up"); }
          }} className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${task.status === 'COMPLETED' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'
            }`}>
            {task.status === 'COMPLETED' && <CheckSquare className="w-3 h-3" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${task.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>{task.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
              <span className={`inline-flex items-center h-4 px-1.5 rounded text-[10px] font-semibold ${task.priority === 'HIGH' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                : task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}>{task.priority}</span>
            </div>
          </div>
        </div>
      ))}
      {tasks.length === 0 && (
        <p className="text-sm text-slate-500">No follow-ups found.</p>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, isLink }) {
  return (
    <div className="flex items-start gap-3.5 group">
      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:border-indigo-100 dark:group-hover:border-indigo-800/50">
        <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
      </div>
      <div className="min-w-0 py-0.5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`text-[13px] font-semibold truncate ${isLink && value ? 'text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer' : 'text-slate-800 dark:text-slate-200'}`}>
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

function MetricCard({ label, value, suffix, color }) {
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-3">
      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-xl font-bold ${color}`}>{value}</span>
        {suffix && <span className="text-xs text-slate-400">{suffix}</span>}
      </div>
    </div>
  );
}

function RelatedTab({ leadId }) {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const { dealsApi, contactsApi, accountsApi } = await import('../../services/api');
        const [fetchedDeals, fetchedContacts, fetchedAccounts] = await Promise.all([
          dealsApi.getByLead(leadId).catch(() => []),
          contactsApi.getByLead(leadId).catch(() => []),
          accountsApi.getByLead(leadId).catch(() => [])
        ]);
        setDeals(fetchedDeals || []);
        setContacts(fetchedContacts || []);
        setAccounts(fetchedAccounts || []);
      } catch (err) {
        console.error("Failed to load related records", err);
      } finally {
        setIsLoading(false);
      }
    }
    if (leadId) fetchData();
  }, [leadId]);

  if (isLoading) return <div className="text-sm text-slate-500 p-4">Loading related records...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Deals ({deals.length})</h3>
        {deals.length === 0 ? (
          <p className="text-sm text-slate-500 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">No deals associated with this lead yet.</p>
        ) : (
          <div className="space-y-2">
            {deals.map(deal => (
              <div key={deal.id} className="p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{deal.title}</span>
                <span className="text-sm text-slate-500">${deal.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Contacts ({contacts.length})</h3>
        {contacts.length === 0 ? (
          <p className="text-sm text-slate-500 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">No contacts associated with this lead yet.</p>
        ) : (
          <div className="space-y-2">
            {contacts.map(contact => (
              <div key={contact.id} className="p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{contact.fullName}</span>
                <span className="text-sm text-slate-500">{contact.email}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Accounts ({accounts.length})</h3>
        {accounts.length === 0 ? (
          <p className="text-sm text-slate-500 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">No accounts associated with this lead yet.</p>
        ) : (
          <div className="space-y-2">
            {accounts.map(account => (
              <div key={account.id} className="p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{account.name}</span>
                <span className="text-sm text-slate-500">{account.industry}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
