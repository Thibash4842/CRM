import { useEffect, useState } from 'react';
import { CreditCard, DollarSign } from 'lucide-react';
import { paymentsApi, invoicesApi } from '../services/api';
import PageHeader, { LoadingSpinner } from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { StatCard } from '../components/ui/Card';
import Card from '../components/ui/Card';
import { Input, Select, Textarea } from '../components/ui/Input';
import { formatCurrency, formatDate } from '../utils/constants';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ invoiceId: '', amount: '', paymentDate: '', paymentMethod: 'Bank Transfer', reference: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([paymentsApi.getAll(), paymentsApi.getSummary(), invoicesApi.getAll()])
      .then(([p, s, inv]) => { setPayments(p); setSummary(s); setInvoices(inv.filter((i) => i.status !== 'PAID')); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleRecord = async () => {
    setSaving(true);
    try {
      await paymentsApi.record({ ...form, invoiceId: Number(form.invoiceId) });
      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Payments" subtitle="Track payments and revenue" onAdd={() => setModalOpen(true)} addLabel="Record Payment" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <StatCard title="Total Revenue" value={formatCurrency(summary?.totalRevenue)} icon={DollarSign} color="from-emerald-500 to-teal-500" />
        <StatCard title="Outstanding" value={formatCurrency(summary?.outstandingAmount)} icon={CreditCard} color="from-amber-500 to-orange-500" />
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Payment History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                {['Invoice', 'Amount', 'Date', 'Method', 'Reference'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-3 px-4 font-medium">{p.invoiceNumber}</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">{formatCurrency(p.amount)}</td>
                  <td className="py-3 px-4">{formatDate(p.paymentDate)}</td>
                  <td className="py-3 px-4">{p.paymentMethod}</td>
                  <td className="py-3 px-4 text-slate-500">{p.reference || '-'}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500">No payments recorded</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Record Payment">
        <div className="space-y-4">
          <Select label="Invoice" value={form.invoiceId} onChange={(e) => setForm({ ...form, invoiceId: e.target.value })}
            options={[{ value: '', label: 'Select invoice' }, ...invoices.map((i) => ({ value: i.id, label: `${i.invoiceNumber} - ${formatCurrency(i.outstandingAmount)} due` }))]} />
          <Input label="Amount ($)" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          <Input label="Payment Date" type="date" value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} required />
          <Select label="Payment Method" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            options={['Bank Transfer', 'Credit Card', 'Cash', 'Check', 'PayPal'].map((m) => ({ value: m, label: m }))} />
          <Input label="Reference" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleRecord} loading={saving}>Record Payment</Button>
        </div>
      </Modal>
    </div>
  );
}
