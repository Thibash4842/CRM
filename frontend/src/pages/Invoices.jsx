import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { invoicesApi, clientsApi } from '../services/api';
import PageHeader, { FilterSelect, EmptyState, LoadingSpinner } from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { Input, Select, Textarea } from '../components/ui/Input';
import { INVOICE_STATUSES, getStatusBadge, formatCurrency, formatDate } from '../utils/constants';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ clientId: '', amount: '', taxAmount: '0', dueDate: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([invoicesApi.getAll(statusFilter || undefined), clientsApi.getAll()])
      .then(([inv, cli]) => { setInvoices(inv); setClients(cli); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [statusFilter]);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await invoicesApi.create({ ...form, clientId: Number(form.clientId) });
      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    await invoicesApi.updateStatus(id, status);
    fetchData();
  };

  return (
    <div>
      <PageHeader title="Invoices" subtitle="Generate and manage invoices" onAdd={() => setModalOpen(true)} addLabel="New Invoice"
        filters={<FilterSelect value={statusFilter} onChange={setStatusFilter} options={INVOICE_STATUSES} label="All Statuses" />} />

      {loading ? <LoadingSpinner /> : invoices.length === 0 ? (
        <EmptyState icon={FileText} title="No invoices" description="Create your first invoice" />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                {['Invoice #', 'Client', 'Amount', 'Due Date', 'Status', 'Outstanding', 'Actions'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const badge = getStatusBadge(inv.status, INVOICE_STATUSES);
                return (
                  <tr key={inv.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-medium">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4">{inv.clientName}</td>
                    <td className="py-3 px-4 font-semibold">{formatCurrency(inv.totalAmount)}</td>
                    <td className="py-3 px-4">{formatDate(inv.dueDate)}</td>
                    <td className="py-3 px-4"><Badge color={badge.color}>{badge.label}</Badge></td>
                    <td className="py-3 px-4">{formatCurrency(inv.outstandingAmount)}</td>
                    <td className="py-3 px-4">
                      {inv.status === 'DRAFT' && <Button size="sm" variant="outline" onClick={() => updateStatus(inv.id, 'SENT')}>Send</Button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Generate Invoice">
        <div className="space-y-4">
          <Select label="Client" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            options={[{ value: '', label: 'Select client' }, ...clients.map((c) => ({ value: c.id, label: c.companyName }))]} />
          <Input label="Amount ($)" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          <Input label="Tax ($)" type="number" value={form.taxAmount} onChange={(e) => setForm({ ...form, taxAmount: e.target.value })} />
          <Input label="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} loading={saving}>Generate</Button>
        </div>
      </Modal>
    </div>
  );
}
