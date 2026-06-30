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
      await notesService.restoreVersion(noteId, versionId);
      if (onRestore) onRestore();
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
        <div className="text-slate-500">Loading versions…</div>
      ) : (
        <ul className="space-y-3">
          {versions.map(v => (
            <li key={v.id} className="border rounded p-3 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium">{new Date(v.savedAt).toLocaleString()}</span>
                  <span className="text-xs text-slate-500">by {v.author?.name || 'Unknown'}</span>
                  {v.label && <span className="ml-2 text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{v.label}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCompare({ from: v, to: null })}>Compare</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleRestore(v.id)}>Restore</Button>
                </div>
              </div>
              {compare.from && compare.from.id === v.id && (
                <div className="mt-2">
                  <h3 className="text-sm font-medium mb-1">Select version to compare with</h3>
                  <select className="w-full border rounded p-1" onChange={e => {
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
                <div className="mt-2">
                  {renderDiff(compare.from, compare.to)}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="flex justify-end pt-2">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}
