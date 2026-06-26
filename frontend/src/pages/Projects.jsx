import { useEffect, useState } from 'react';
import { FolderKanban, Plus } from 'lucide-react';
import { projectsApi, clientsApi } from '../services/api';
import PageHeader, { FilterSelect, EmptyState, LoadingSpinner } from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { Input, Select, Textarea } from '../components/ui/Input';
import { PROJECT_STATUSES, getStatusBadge, formatDate } from '../utils/constants';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', status: 'PLANNING', progress: 0, clientId: '', startDate: '', endDate: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      projectsApi.getAll(statusFilter || undefined),
      clientsApi.getAll(),
    ]).then(([p, c]) => { setProjects(p); setClients(c); }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [statusFilter]);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await projectsApi.create({ ...form, clientId: form.clientId ? Number(form.clientId) : null, progress: Number(form.progress) });
      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Projects" subtitle="Manage client projects and timelines" onAdd={() => setModalOpen(true)} addLabel="New Project"
        filters={<FilterSelect value={statusFilter} onChange={setStatusFilter} options={PROJECT_STATUSES} label="All Statuses" />} />

      {loading ? <LoadingSpinner /> : projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects" description="Create your first project" action={<Button onClick={() => setModalOpen(true)}>New Project</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => {
            const badge = getStatusBadge(project.status, PROJECT_STATUSES);
            return (
              <Card key={project.id} hover>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold">{project.name}</h3>
                  <Badge color={badge.color}>{badge.label}</Badge>
                </div>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{project.description || 'No description'}</p>
                {project.clientName && <p className="text-xs text-slate-400 mb-4">Client: {project.clientName}</p>}
                <div className="mb-2 flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full gradient-primary rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }} />
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-3">
                  <span>{formatDate(project.startDate)}</span>
                  <span>{formatDate(project.endDate)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Project" size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Project Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Select label="Client" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            options={[{ value: '', label: 'Select client' }, ...clients.map((c) => ({ value: c.id, label: c.companyName }))]} />
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={PROJECT_STATUSES} />
          <Input label="Progress (%)" type="number" min="0" max="100" value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} />
          <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          <Input label="End Date" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
        </div>
        <div className="mt-4"><Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} loading={saving}>Create</Button>
        </div>
      </Modal>
    </div>
  );
}
