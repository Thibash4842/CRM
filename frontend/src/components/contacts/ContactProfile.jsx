import { Mail, Phone, MapPin, Building2, Globe, Calendar, Clock, Edit, MoreHorizontal, Video, MessageCircle, Briefcase, DollarSign, Activity, FileText, CheckSquare, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import ContactTimeline from './ContactTimeline';

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
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'emails', label: 'Emails', icon: Mail },
  { id: 'calls', label: 'Calls', icon: Phone },
  { id: 'meetings', label: 'Meetings', icon: Video },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'deals', label: 'Deals', icon: Briefcase },
];

// Mock data for Emails tab
const MOCK_EMAILS = [
  { id: 1, subject: 'Re: Enterprise License Renewal', from: 'Contact', time: '2h ago', status: 'opened', snippet: 'Thanks for the updated pricing. Let me review this with my team and get back to you by Friday.' },
  { id: 2, subject: 'Product Demo Follow-up', from: 'You', time: 'Yesterday', status: 'sent', snippet: 'Hi, just following up on our demo session. Attached the recording and the feature comparison sheet.' },
  { id: 3, subject: 'Q3 Requirements Document', from: 'Contact', time: '3 days ago', status: 'replied', snippet: 'Please find attached the requirements document for Q3. Looking forward to your proposal.' },
];

// Mock data for Calls tab
const MOCK_CALLS = [
  { id: 1, type: 'outbound', duration: '18 min', time: 'Today, 10:30 AM', notes: 'Discussed enterprise features and pricing. Contact showed strong interest in analytics module.', outcome: 'Interested' },
  { id: 2, type: 'inbound', duration: '5 min', time: 'Yesterday, 3:15 PM', notes: 'Quick call about integration capabilities.', outcome: 'Follow-up needed' },
  { id: 3, type: 'outbound', duration: '32 min', time: 'Mon, 14 Jun', notes: 'Full product demo with the technical team.', outcome: 'Positive' },
];

// Mock data for Meetings
const MOCK_MEETINGS = [
  { id: 1, title: 'Quarterly Business Review', date: 'Tomorrow, 2:00 PM', attendees: 4, location: 'Google Meet', status: 'upcoming' },
  { id: 2, title: 'Product Demo - Phase 2', date: 'Thu, 22 Jun, 10:00 AM', attendees: 6, location: 'Zoom', status: 'upcoming' },
  { id: 3, title: 'Discovery Call', date: 'Mon, 14 Jun, 3:00 PM', attendees: 2, location: 'Phone', status: 'completed' },
];

// Mock notes
const MOCK_NOTES = [
  { id: 1, content: 'Decision maker confirmed. Budget approved for Q3. Need to send updated proposal by EOW.', author: 'You', time: 'Today, 11:00 AM' },
  { id: 2, content: 'Contact mentioned they are also evaluating two other vendors. Price sensitivity is medium.', author: 'Sarah K.', time: 'Yesterday' },
  { id: 3, content: 'Key stakeholders: CTO (technical approval), CFO (budget sign-off), VP Engineering (champion).', author: 'You', time: '3 days ago' },
];

// Mock tasks
const MOCK_TASKS = [
  { id: 1, title: 'Send updated proposal', due: 'Tomorrow', priority: 'high', done: false },
  { id: 2, title: 'Schedule demo with tech team', due: 'Thu, 22 Jun', priority: 'medium', done: false },
  { id: 3, title: 'Follow up on pricing feedback', due: 'Fri, 23 Jun', priority: 'low', done: false },
  { id: 4, title: 'Initial discovery call', due: 'Mon, 14 Jun', priority: 'high', done: true },
];

// Mock deals
const MOCK_DEALS = [
  { id: 1, name: 'Enterprise License - Annual', value: '$48,000', stage: 'Proposal', probability: 75, close: 'Jun 30, 2026' },
  { id: 2, name: 'Analytics Add-on Module', value: '$12,000', stage: 'Negotiation', probability: 60, close: 'Jul 15, 2026' },
];

export default function ContactProfile({ contact, onEdit }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!contact) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-slate-950 p-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-5">
          <Building2 className="w-9 h-9 text-slate-300 dark:text-slate-700" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">360° Customer Profile</h2>
        <p className="text-sm text-slate-500 max-w-sm leading-relaxed">Select a contact from the navigator to view their complete profile, activity history, and AI-powered insights.</p>
      </div>
    );
  }

  const avatarColor = getAvatarColor(contact.contactName || contact.companyName);
  const score = contact.leadScore || 75;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden">
      {/* ═══ Header Section ═══ */}
      <div className="flex-shrink-0 border-b border-slate-200/80 dark:border-slate-800/80">
        {/* Profile Header */}
        <div className="px-6 pt-5 pb-4">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarColor} text-white flex items-center justify-center text-2xl font-bold shadow-lg`}>
                {contact.contactName?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-[3px] border-white dark:border-slate-950 rounded-full" />
            </div>

            {/* Name + Meta */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate">{contact.contactName || 'Unknown Contact'}</h1>
                <span className="flex-shrink-0 inline-flex items-center h-5 px-2 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-[11px] font-semibold">
                  Decision Maker
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {contact.jobTitle || 'Executive'} at <span className="font-medium text-slate-700 dark:text-slate-300">{contact.companyName}</span>
                </span>
                {contact.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {contact.email}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => onEdit(contact)} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <Edit className="w-3.5 h-3.5" /> Edit
              </button>
              <button className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
              <button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm shadow-indigo-500/20 transition-all">
                <Calendar className="w-3.5 h-3.5" /> Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Phone, label: 'Call', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30' },
              { icon: Mail, label: 'Email', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30' },
              { icon: Video, label: 'Meet', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30' },
              { icon: MessageCircle, label: 'WhatsApp', color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30' },
            ].map(action => {
              const Icon = action.icon;
              return (
                <button key={action.label} className={`flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium transition-all ${action.color}`}>
                  <Icon className="w-4 h-4" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 flex gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 pb-3 pt-1 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 dark:bg-indigo-400 rounded-t" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ Tab Content ═══ */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab contact={contact} />}
          {activeTab === 'timeline' && <ContactTimeline />}
          {activeTab === 'emails' && <EmailsTab />}
          {activeTab === 'calls' && <CallsTab />}
          {activeTab === 'meetings' && <MeetingsTab />}
          {activeTab === 'notes' && <NotesTab />}
          {activeTab === 'tasks' && <TasksTab />}
          {activeTab === 'deals' && <DealsTab />}
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════ */
/*  OVERVIEW TAB                          */
/* ═══════════════════════════════════════ */
function OverviewTab({ contact }) {
  const score = contact.leadScore || 75;

  return (
    <div className="space-y-5">
      {/* AI Smart Summary */}
      <div className="rounded-xl bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-800/40 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-md bg-indigo-600 text-white text-xs">✨</span>
          <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">AI Smart Summary</h3>
        </div>
        <p className="text-sm text-indigo-900/70 dark:text-indigo-300/80 leading-relaxed mb-4">
          {contact.contactName || 'This contact'} visited the pricing page 4 times this week, opened the proposal email twice, and attended the product demo. <strong className="font-semibold text-indigo-900 dark:text-indigo-200">High buying intent detected.</strong>
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/70 dark:bg-slate-900/60 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1">Intent Score</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-emerald-600">92</span>
              <span className="text-xs text-emerald-600 font-semibold">↑ 14%</span>
            </div>
          </div>
          <div className="bg-white/70 dark:bg-slate-900/60 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1">Health Score</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-blue-600">A+</span>
              <span className="text-xs text-blue-500 font-medium">Excellent</span>
            </div>
          </div>
          <div className="bg-white/70 dark:bg-slate-900/60 rounded-lg p-3 backdrop-blur-sm flex flex-col justify-center">
            <button className="w-full h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm transition-colors">
              Call Today
            </button>
          </div>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-2 gap-5">
        {/* Personal Information */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Personal Information</h3>
          </div>
          <div className="p-4 space-y-3.5">
            <InfoRow icon={Mail} label="Email" value={contact.email} />
            <InfoRow icon={Phone} label="Phone" value={contact.phone} />
            <InfoRow icon={MapPin} label="Location" value={[contact.city, contact.state, contact.country].filter(Boolean).join(', ')} />
          </div>
        </div>

        {/* Company Information */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Company Information</h3>
          </div>
          <div className="p-4 space-y-3.5">
            <InfoRow icon={Building2} label="Company" value={contact.companyName} />
            <InfoRow icon={Globe} label="Website" value={contact.website} isLink />
            <InfoRow icon={Briefcase} label="Industry" value={contact.industry} />
          </div>
        </div>

        {/* Social Information */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Social Profiles</h3>
          </div>
          <div className="p-4 space-y-3.5">
            <InfoRow icon={Globe} label="LinkedIn" value="linkedin.com/in/contact" isLink />
            <InfoRow icon={Globe} label="Twitter" value="@contact" />
            <InfoRow icon={Globe} label="Website" value={contact.website} isLink />
          </div>
        </div>

        {/* Customer Metrics */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Customer Metrics</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <MetricCard label="Lead Score" value={score} suffix="/100" color={score >= 80 ? 'text-emerald-600' : 'text-amber-600'} />
              <MetricCard label="Engagement" value="84" suffix="%" color="text-blue-600" />
              <MetricCard label="Lifetime Value" value="$48K" color="text-purple-600" />
              <MetricCard label="Open Deals" value="$60K" color="text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Notes section */}
      {contact.notes && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Notes</h3>
          </div>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{contact.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════ */
/*  EMAILS TAB                            */
/* ═══════════════════════════════════════ */
function EmailsTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Email History</h3>
        <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors">
          <Mail className="w-3.5 h-3.5" /> Compose
        </button>
      </div>
      {MOCK_EMAILS.map(email => (
        <div key={email.id} className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-colors cursor-pointer">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center h-5 px-1.5 rounded text-[10px] font-semibold ${
                  email.from === 'You' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                }`}>
                  {email.from === 'You' ? '↑ Sent' : '↓ Received'}
                </span>
                <span className={`inline-flex items-center h-5 px-1.5 rounded text-[10px] font-semibold ${
                  email.status === 'opened' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {email.status === 'opened' ? '👁 Opened' : email.status === 'replied' ? '↩ Replied' : '✓ Sent'}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{email.subject}</h4>
            </div>
            <span className="text-xs text-slate-400 flex-shrink-0">{email.time}</span>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{email.snippet}</p>
        </div>
      ))}
    </div>
  );
}


/* ═══════════════════════════════════════ */
/*  CALLS TAB                             */
/* ═══════════════════════════════════════ */
function CallsTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Call History</h3>
        <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors">
          <Phone className="w-3.5 h-3.5" /> Log Call
        </button>
      </div>
      {MOCK_CALLS.map(call => (
        <div key={call.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                call.type === 'outbound' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'
              }`}>
                <Phone className={`w-4 h-4 ${call.type === 'outbound' ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
              </div>
              <div>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200 capitalize">{call.type} Call</span>
                <span className="text-xs text-slate-400 ml-2">· {call.duration}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center h-5 px-2 rounded text-[10px] font-semibold ${
                call.outcome === 'Interested' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : call.outcome === 'Positive' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>{call.outcome}</span>
              <span className="text-xs text-slate-400">{call.time}</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">{call.notes}</p>
        </div>
      ))}
    </div>
  );
}


/* ═══════════════════════════════════════ */
/*  MEETINGS TAB                          */
/* ═══════════════════════════════════════ */
function MeetingsTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Meetings</h3>
        <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition-colors">
          <Calendar className="w-3.5 h-3.5" /> Schedule
        </button>
      </div>
      {MOCK_MEETINGS.map(meeting => (
        <div key={meeting.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                meeting.status === 'upcoming' ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-slate-100 dark:bg-slate-800'
              }`}>
                <Video className={`w-5 h-5 ${meeting.status === 'upcoming' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{meeting.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{meeting.date} · {meeting.location}</p>
                <p className="text-xs text-slate-400 mt-1">{meeting.attendees} attendees</p>
              </div>
            </div>
            <span className={`inline-flex items-center h-5 px-2 rounded text-[10px] font-semibold ${
              meeting.status === 'upcoming' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}>{meeting.status === 'upcoming' ? 'Upcoming' : 'Completed'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}


/* ═══════════════════════════════════════ */
/*  NOTES TAB                             */
/* ═══════════════════════════════════════ */
function NotesTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Notes</h3>
        <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors">
          <FileText className="w-3.5 h-3.5" /> Add Note
        </button>
      </div>
      {MOCK_NOTES.map(note => (
        <div key={note.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-2">{note.content}</p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-medium">{note.author}</span>
            <span>·</span>
            <span>{note.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}


/* ═══════════════════════════════════════ */
/*  TASKS TAB                             */
/* ═══════════════════════════════════════ */
function TasksTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Tasks</h3>
        <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors">
          <CheckSquare className="w-3.5 h-3.5" /> Add Task
        </button>
      </div>
      {MOCK_TASKS.map(task => (
        <div key={task.id} className={`p-4 rounded-xl border bg-white dark:bg-slate-950 flex items-start gap-3 ${task.done ? 'border-slate-100 dark:border-slate-800/50 opacity-60' : 'border-slate-200 dark:border-slate-800'}`}>
          <button className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            task.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'
          }`}>
            {task.done && <CheckSquare className="w-3 h-3" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${task.done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>{task.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400">Due: {task.due}</span>
              <span className={`inline-flex items-center h-4 px-1.5 rounded text-[10px] font-semibold ${
                task.priority === 'high' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                : task.priority === 'medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}>{task.priority}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


/* ═══════════════════════════════════════ */
/*  DEALS TAB                             */
/* ═══════════════════════════════════════ */
function DealsTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Deals</h3>
        <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors">
          <Briefcase className="w-3.5 h-3.5" /> Create Deal
        </button>
      </div>
      {MOCK_DEALS.map(deal => (
        <div key={deal.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{deal.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">Expected close: {deal.close}</p>
            </div>
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{deal.value}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center h-5 px-2 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">{deal.stage}</span>
            <div className="flex-1">
              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${deal.probability}%` }} />
              </div>
            </div>
            <span className="text-xs font-medium text-slate-500">{deal.probability}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}


/* ═══════════════════════════════════════ */
/*  HELPER COMPONENTS                     */
/* ═══════════════════════════════════════ */
function InfoRow({ icon: Icon, label, value, isLink }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">{label}</p>
        <p className={`text-sm font-medium mt-0.5 truncate ${isLink && value ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>
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
