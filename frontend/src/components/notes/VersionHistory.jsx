import React, { useEffect, useState } from 'react';
import { notesService } from '../../services/notesService';
import Button from '../ui/Button';
import { ArrowRight, Clock, User } from 'lucide-react';

/**
 * VersionHistory displays a list of saved versions for a note.
 * It allows the user to compare versions (side‑by‑side diff) and restore a previous version.
 * All UI is premium‑styled and matches the rest of the Notes module.
 */
export default function VersionHistory({ noteId, onClose, onRestore }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compare, setCompare] = useState({ from: null, to: null });

  useEffect(() => {
    async function fetchVersions() {
      setLoading(true);
      try {
        const v = await notesService.getVersions(noteId);
        setVersions(v.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)));
      } catch (e) {
        console.error('Failed to load versions', e);
      }
      setLoading(false);
    }
    fetchVersions();
  }, [noteId]);

  const handleRestore = async (versionId) => {
    try {
      const restored = await notesService.restoreVersion(noteId, versionId);
      if (onRestore) onRestore(restored);
    } catch (e) {
      console.error('Restore failed', e);
    }
  };

  const renderDiff = (from, to) => {
    const fromLines = (from?.content || '').split('\n');
    const toLines = (to?.content || '').split('\n');
    const max = Math.max(fromLines.length, toLines.length);
    const rows = [];
    for (let i = 0; i < max; i++) {
      const f = fromLines[i] ?? '';
      const t = toLines[i] ?? '';
      if (f === t) {
        rows.push(<div key={i} className="text-slate-500">{f}</div>);
      } else {
        if (f) rows.push(<div key={`del-${i}`} className="bg-rose-100 dark:bg-rose-900/30"><del>{f}</del></div>);
        if (t) rows.push(<div key={`ins-${i}`} className="bg-emerald-100 dark:bg-emerald-900/30"><ins>{t}</ins></div>);
      }
    }
    return <div className="p-2 overflow-auto max-h-64 border rounded">{rows}</div>;
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold mb-2">Version History</h2>
      {loading ? (
        <div className="text-slate-500 text-sm">Loading versions…</div>
      ) : versions.length > 0 ? (
        <ul className="space-y-3">
          {versions.map(v => (
            <li key={v.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 hover:shadow-md transition-all bg-white dark:bg-slate-950">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{new Date(v.savedAt).toLocaleString()}</span>
                  <span className="text-xs text-slate-500">by {v.author?.name || 'Unknown'}</span>
                  {v.label && <span className="ml-2 text-[10px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full">{v.label}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setCompare({ from: v, to: null })}>Compare</Button>
                  <Button variant="outline" size="sm" onClick={() => handleRestore(v.id)}>Restore</Button>
                </div>
              </div>
              {compare.from && compare.from.id === v.id && (
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Select version to compare with</h3>
                  <select className="w-full border border-slate-250 dark:border-slate-800 rounded-lg p-1.5 text-xs bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" onChange={e => {
                    const toVersion = versions.find(vv => vv.id === e.target.value);
                    setCompare({ from: v, to: toVersion });
                  }}>
                    <option value="">-- Choose version --</option>
                    {versions.filter(vv => vv.id !== v.id).map(vv => (
                      <option key={vv.id} value={vv.id}>
                        {new Date(vv.savedAt).toLocaleString()} ({vv.author?.name})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {compare.from && compare.to && compare.from.id === v.id && (
                <div className="mt-3">
                  {renderDiff(compare.from, compare.to)}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-slate-500 text-sm py-8 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800/60">
          No version history available yet. Edits to this note will automatically create versions.
        </div>
      )}
      <div className="flex justify-end pt-2">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}
