import { useMemo } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import {
  PlusCircle, Edit3, Trash2, Archive, RotateCw,
  Share2, MessageSquare, AtSign, Paperclip, EyeOff,
  Clock
} from 'lucide-react';

// ─── Activity Type Config ──────────────────────────────────────────────────
const ACTIVITY_CONFIG = {
  created: {
    icon: PlusCircle,
    color: 'text-emerald-600 dark:text-emerald-400',
    ring: 'bg-emerald-50 dark:bg-emerald-900/25 ring-emerald-200 dark:ring-emerald-800/50',
    dot: 'bg-emerald-500',
    label: (meta, actor) => `${actor} created this note`,
  },
  edited: {
    icon: Edit3,
    color: 'text-indigo-600 dark:text-indigo-400',
    ring: 'bg-indigo-50 dark:bg-indigo-900/25 ring-indigo-200 dark:ring-indigo-800/50',
    dot: 'bg-indigo-500',
    label: (meta, actor) => `${actor} edited the ${meta?.field || 'note'}`,
  },
  deleted: {
    icon: Trash2,
    color: 'text-red-600 dark:text-red-400',
    ring: 'bg-red-50 dark:bg-red-900/25 ring-red-200 dark:ring-red-800/50',
    dot: 'bg-red-500',
    label: (meta, actor) => `${actor} deleted this note`,
  },
  archived: {
    icon: Archive,
    color: 'text-amber-600 dark:text-amber-400',
    ring: 'bg-amber-50 dark:bg-amber-900/25 ring-amber-200 dark:ring-amber-800/50',
    dot: 'bg-amber-500',
    label: (meta, actor) => `${actor} archived this note`,
  },
  restored: {
    icon: RotateCw,
    color: 'text-teal-600 dark:text-teal-400',
    ring: 'bg-teal-50 dark:bg-teal-900/25 ring-teal-200 dark:ring-teal-800/50',
    dot: 'bg-teal-500',
    label: (meta, actor) => `${actor} restored this note`,
  },
  shared: {
    icon: Share2,
    color: 'text-violet-600 dark:text-violet-400',
    ring: 'bg-violet-50 dark:bg-violet-900/25 ring-violet-200 dark:ring-violet-800/50',
    dot: 'bg-violet-500',
    label: (meta, actor) => `${actor} shared this note`,
  },
  unshared: {
    icon: EyeOff,
    color: 'text-slate-600 dark:text-slate-400',
    ring: 'bg-slate-50 dark:bg-slate-900/25 ring-slate-200 dark:ring-slate-700/50',
    dot: 'bg-slate-400',
    label: (meta, actor) => `${actor} made this note private`,
  },
  comment_added: {
    icon: MessageSquare,
    color: 'text-blue-600 dark:text-blue-400',
    ring: 'bg-blue-50 dark:bg-blue-900/25 ring-blue-200 dark:ring-blue-800/50',
    dot: 'bg-blue-500',
    label: (meta, actor) => `${actor} added a comment`,
  },
  mention: {
    icon: AtSign,
    color: 'text-pink-600 dark:text-pink-400',
    ring: 'bg-pink-50 dark:bg-pink-900/25 ring-pink-200 dark:ring-pink-800/50',
    dot: 'bg-pink-500',
    label: (meta, actor) => `${actor} mentioned ${meta?.mentioned || 'someone'}`,
  },
  attachment_added: {
    icon: Paperclip,
    color: 'text-orange-600 dark:text-orange-400',
    ring: 'bg-orange-50 dark:bg-orange-900/25 ring-orange-200 dark:ring-orange-800/50',
    dot: 'bg-orange-500',
    label: (meta, actor) => `${actor} attached ${meta?.filename || 'a file'}`,
  },
};

// ─── Single Event Row ──────────────────────────────────────────────────────
function ActivityEvent({ event, isLast }) {
  const config = ACTIVITY_CONFIG[event.type] || ACTIVITY_CONFIG.edited;
  const Icon = config.icon;
  const actorName = event.actor?.name || 'Someone';

  const timeAgo = formatDistanceToNow(new Date(event.timestamp), { addSuffix: true });
  const fullTime = format(new Date(event.timestamp), 'MMM d, yyyy · h:mm a');

  return (
    <div className="relative flex gap-4 group">
      {/* Vertical connector line */}
      {!isLast && (
        <div className="absolute left-[19px] top-10 bottom-0 w-px bg-gradient-to-b from-slate-200 dark:from-slate-700 to-transparent" />
      )}

      {/* Icon bubble */}
      <div className={`relative z-10 mt-0.5 w-10 h-10 rounded-full flex items-center justify-center ring-2 shrink-0 shadow-sm ${config.ring}`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6 min-w-0">
        {/* Main row */}
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* User Avatar */}
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 shadow-sm ${event.actor?.color || 'bg-slate-500'}`}
              title={actorName}
            >
              {event.actor?.initials || '?'}
            </div>

            {/* Action label */}
            <span className="text-sm text-slate-700 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {event.actor?.name || 'Someone'}
              </span>{' '}
              {config.label(event.meta, '').trim()}
            </span>
          </div>

          {/* Timestamp */}
          <time
            title={fullTime}
            className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0 mt-0.5 font-medium"
          >
            {timeAgo}
          </time>
        </div>

        {/* Optional preview snippet (comments / filenames) */}
        {event.meta?.preview && (
          <div className="mt-2 ml-7 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 text-xs text-slate-500 dark:text-slate-400 italic max-w-sm line-clamp-2">
            "{event.meta.preview}"
          </div>
        )}
        {event.meta?.filename && (
          <div className="mt-2 ml-7 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200/60 dark:border-orange-800/40 text-xs font-semibold text-orange-700 dark:text-orange-400">
            <Paperclip className="w-3 h-3" />
            {event.meta.filename}
          </div>
        )}
        {event.meta?.mentioned && !event.meta?.preview && (
          <div className="mt-2 ml-7 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-50 dark:bg-pink-900/20 border border-pink-200/60 dark:border-pink-800/40 text-xs font-semibold text-pink-700 dark:text-pink-400">
            <AtSign className="w-3 h-3" />
            @{event.meta.mentioned}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Date Group Header ─────────────────────────────────────────────────────
function DateSeparator({ label }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function ActivityTimeline({ note }) {
  const grouped = useMemo(() => {
    const raw = [...(note?.activity || [])];
    // Sort newest first
    raw.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = [];
    const seen = new Set();

    raw.forEach(event => {
      const d = new Date(event.timestamp);
      d.setHours(0, 0, 0, 0);
      const key = d.toDateString();

      let label;
      if (d.getTime() === today.getTime()) label = 'Today';
      else if (d.getTime() === yesterday.getTime()) label = 'Yesterday';
      else label = format(d, 'MMMM d, yyyy');

      if (!seen.has(key)) {
        seen.add(key);
        groups.push({ type: 'date', label, key });
      }
      groups.push({ type: 'event', event });
    });

    return groups;
  }, [note?.activity]);

  if (!note?.activity || note.activity.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3 ring-2 ring-slate-100 dark:ring-slate-700">
          <Clock className="w-5 h-5 text-slate-400" />
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No activity yet</p>
        <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
          Actions like edits, shares, and comments will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      {grouped.map((item, idx) => {
        if (item.type === 'date') {
          return <DateSeparator key={item.key + idx} label={item.label} />;
        }

        // Determine if last *event* in list
        const nextItem = grouped[idx + 1];
        const isLast = !nextItem || nextItem.type === 'date';

        return (
          <ActivityEvent
            key={item.event.id}
            event={item.event}
            isLast={isLast}
          />
        );
      })}
    </div>
  );
}
