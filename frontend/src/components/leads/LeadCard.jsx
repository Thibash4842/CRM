import Button from '../ui/Button';
import { Phone, Calendar, Mail, FileText, Star, Activity, CheckCircle, XCircle, Copy, Clock, Pencil, User } from 'lucide-react';
import { formatDateTime, getStatusBadge, LEAD_STATUSES } from '../../utils/constants';
import { useNavigate } from 'react-router-dom';

function OwnerBadge({ owner }) {
  const o = owner && owner !== '' ? owner : 'Unassigned';
  const initials = o === 'Unassigned' ? '?' : (o.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U');
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <div className="w-4 h-4 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-slate-300">
        {initials}
      </div>
      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">Assigned to: <span className="text-slate-700 dark:text-slate-300">{o}</span></span>
    </div>
  );
}

function PriorityBadge({ priority }) {
  const p = priority ? String(priority).toUpperCase() : 'COLD';
  let label = 'Cold';
  let color = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  if (p === 'HOT') { label = 'Hot'; color = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'; }
  else if (p === 'WARM') { label = 'Warm'; color = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'; }
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
      <Star className="w-4 h-4" /> {label}
    </div>
  );
}

function StatusBadge({ status }) {
  const badge = getStatusBadge(status, LEAD_STATUSES);
  if (status === 'WON') return <div className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"><CheckCircle className="w-3 h-3" /> BOOKED</div>;
  if (status === 'LOST') return <div className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><XCircle className="w-3 h-3" /> Lost</div>;
  if (status === 'FOLLOW_UP') return <div className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"><Clock className="w-3 h-3" /> Follow Up</div>;
  if (status === 'DUPLICATE') return <div className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400"><Copy className="w-3 h-3" /> Duplicate</div>;

  return <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-white ${badge.color}`}>{badge.label}</div>;
}

export default function LeadCard({ lead, onOpen, onConvert, onShowBookedDetails, onQuickAction, vertical = false }) {
  const navigate = useNavigate();
  
  const isValidActivity = lead.lastActivity && lead.lastActivity !== 'No activity';
  const lastActivity = isValidActivity ? lead.lastActivity : (lead.nextAction || (lead.notes ? 'Note added' : 'No activity'));
  
  const isValidFollowUp = lead.nextFollowUp && lead.nextFollowUp !== 'No follow-up';
  const nextFollowUp = isValidFollowUp ? lead.nextFollowUp : (lead.followUpDate || 'No follow-up');
  const initials = (lead.firstName?.[0] || '') + (lead.lastName?.[0] || '');
  const displayName = lead.fullName || `${lead.firstName} ${lead.lastName}`;

  let borderColorClass = 'border-l-4 border-transparent hover:border-blue-500';
  if (lead.status === 'WON') borderColorClass = 'border-l-4 border-emerald-500 shadow-emerald-500/10';
  if (lead.status === 'LOST') borderColorClass = 'border-l-4 border-red-500 shadow-red-500/10';
  if (lead.status === 'FOLLOW_UP') borderColorClass = 'border-l-4 border-amber-500 shadow-amber-500/10';
  if (lead.status === 'DUPLICATE') borderColorClass = 'border-l-4 border-slate-500 shadow-slate-500/10';
  if (lead.status === 'NEW') borderColorClass = 'border-l-4 border-blue-500 shadow-blue-500/10';
  if (lead.status === 'CONTACTED') borderColorClass = 'border-l-4 border-orange-500 shadow-orange-500/10';
  if (lead.status === 'MEETING') borderColorClass = 'border-l-4 border-purple-500 shadow-purple-500/10';
  if (lead.status === 'PROPOSAL_SENT') borderColorClass = 'border-l-4 border-indigo-500 shadow-indigo-500/10';

  if (vertical) {
    return (
      <div className={`glass-card p-5 rounded-2xl w-full overflow-hidden flex flex-col gap-4 transition-all cursor-pointer hover:shadow-md ${borderColorClass}`} onClick={() => onOpen(lead)}>
        {/* Top Section: Info */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 shrink-0 rounded-xl gradient-primary flex items-center justify-center text-white font-semibold text-lg">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-[15px] truncate text-slate-900 dark:text-white">
              {displayName}
            </h4>
            <p className="text-sm text-slate-500 truncate mt-0.5">{lead.jobTitle ? `${lead.jobTitle} at ${lead.company}` : lead.company || 'No Company'}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-1.5 text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800/50 pb-3">
          {lead.email && <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /><span className="truncate">{lead.email}</span></div>}
          {lead.phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /><span className="truncate">{lead.phone}</span></div>}
          <OwnerBadge owner={lead.owner} />
        </div>

        {/* Middle Section: Badges & Activity */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={lead.status} />
            <PriorityBadge priority={lead.priority} />
          </div>
          <div className="flex flex-col gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between"><div className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-slate-400" />Activity:</div> <span className="truncate max-w-[120px] text-right text-slate-700 dark:text-slate-300">{lastActivity}</span></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" />Follow-up:</div> <span className="truncate max-w-[120px] text-right text-slate-700 dark:text-slate-300">{nextFollowUp}</span></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" />Updated:</div> <span className="truncate max-w-[120px] text-right text-slate-700 dark:text-slate-300">{formatDateTime(lead.updatedAt || lead.createdAt || new Date().toISOString())}</span></div>
          </div>
        </div>

        {/* Bottom Section: Actions */}
        <div className="flex flex-col gap-3 mt-auto pt-2 border-t border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center justify-between">
            <button onClick={(e) => { e.stopPropagation(); onQuickAction('call', lead); }} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors"><Phone className="w-4 h-4" /></button>
            <button onClick={(e) => { e.stopPropagation(); onQuickAction('email', lead); }} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors"><Mail className="w-4 h-4" /></button>
            <button onClick={(e) => { e.stopPropagation(); onQuickAction('meeting', lead); }} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors"><Calendar className="w-4 h-4" /></button>
            <button onClick={(e) => { e.stopPropagation(); onQuickAction('note', lead); }} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors"><FileText className="w-4 h-4" /></button>
            <button onClick={(e) => { e.stopPropagation(); navigate(`/leads/edit/${lead.id}`); }} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors"><Pencil className="w-4 h-4" /></button>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            {lead.status === 'WON' ? (
              <Button variant="success" size="md" className="w-full shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0" onClick={() => onShowBookedDetails(lead)}>✓ Booked</Button>
            ) : (
              <Button variant="primary" size="md" className="w-full shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white border-0" onClick={() => onConvert(lead)}>Convert Lead</Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass-card p-5 rounded-2xl w-full overflow-hidden flex flex-col sm:flex-row sm:items-center gap-6 transition-all cursor-pointer hover:shadow-md ${borderColorClass}`} onClick={() => onOpen(lead)}>
      {/* Left Section: Info */}
      <div className="flex items-center gap-4 min-w-0 sm:w-1/3 shrink-0">
        <div className="w-12 h-12 shrink-0 rounded-xl gradient-primary flex items-center justify-center text-white font-semibold text-lg shadow-sm">
          {initials}
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-base truncate text-slate-900 dark:text-white">
            {displayName} {lead.jobTitle && <span className="font-normal text-slate-500 text-[13px] ml-1">· {lead.jobTitle}</span>}
          </h4>
          <p className="text-[13px] text-slate-600 dark:text-slate-400 truncate font-medium mt-0.5">{lead.company || 'No Company'}</p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 truncate">
            {lead.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{lead.email}</span>}
            {lead.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{lead.phone}</span>}
          </div>
          <OwnerBadge owner={lead.owner} />
        </div>
      </div>

      {/* Center Section: Badges & Activity */}
      <div className="flex flex-col gap-2.5 min-w-0 sm:flex-1 border-l border-slate-100 dark:border-slate-800 pl-6 py-1">
        <div className="flex items-center gap-2">
          <StatusBadge status={lead.status} />
          <PriorityBadge priority={lead.priority} />
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-1 text-[11px] font-medium text-slate-500">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800/50">
            <Activity className="w-3.5 h-3.5 text-slate-400" /> <span className="text-slate-600 dark:text-slate-300">Activity: {lastActivity}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800/50">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> <span className="text-slate-600 dark:text-slate-300">Follow-up: {nextFollowUp}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800/50">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> <span className="text-slate-600 dark:text-slate-300">Updated: {formatDateTime(lead.updatedAt || lead.createdAt || new Date().toISOString())}</span>
          </div>
        </div>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center justify-end gap-5 shrink-0 ml-auto border-l border-slate-100 dark:border-slate-800 pl-6">
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); onQuickAction('call', lead); }} className="p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-400 hover:text-indigo-600 transition-all"><Phone className="w-4 h-4" /></button>
          <button onClick={(e) => { e.stopPropagation(); onQuickAction('email', lead); }} className="p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-400 hover:text-indigo-600 transition-all"><Mail className="w-4 h-4" /></button>
          <button onClick={(e) => { e.stopPropagation(); onQuickAction('meeting', lead); }} className="p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-400 hover:text-indigo-600 transition-all"><Calendar className="w-4 h-4" /></button>
          <button onClick={(e) => { e.stopPropagation(); onQuickAction('note', lead); }} className="p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-400 hover:text-indigo-600 transition-all"><FileText className="w-4 h-4" /></button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1"></div>
          <button onClick={(e) => { e.stopPropagation(); navigate(`/leads/edit/${lead.id}`); }} className="p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-400 hover:text-indigo-600 transition-all"><Pencil className="w-4 h-4" /></button>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          {lead.status === 'WON' ? (
            <Button variant="success" size="md" className="shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0 px-4 whitespace-nowrap" onClick={() => onShowBookedDetails(lead)}>✓ Booked</Button>
          ) : (
            <Button variant="primary" size="md" className="shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white border-0 px-4" onClick={() => onConvert(lead)}>Convert Lead</Button>
          )}
        </div>
      </div>
    </div>
  );
}
