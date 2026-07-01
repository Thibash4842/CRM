import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft, Plus, Trash2, Paperclip,
  CheckCircle, Clock, Save, FileText, Send, User, MessageSquare, DollarSign, Download, Mail
} from 'lucide-react';
import Card from '../components/ui/Card';
import { useFinance } from '../context/FinanceContext';
import Button from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import ProductTable from '../components/ui/ProductTable';
import { clientsApi } from '../services/api';

export default function InvoiceDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addInvoice } = useFinance();
  const [products, setProducts] = useState(location.state?.products || [
    { id: 1, name: '', description: '', quantity: 1, price: 0, discount: 0, tax: 0 }
  ]);
  const [status, setStatus] = useState('DRAFT');
  const [activities, setActivities] = useState([
    { id: 1, action: 'Invoice created', date: 'Just now', user: 'You', icon: Plus, color: 'indigo' }
  ]);

  const [customer, setCustomer] = useState(location.state?.customer || '');
  const [customersList, setCustomersList] = useState([{ value: '', label: 'Select a customer' }]);

  React.useEffect(() => {
    clientsApi.getAll().then(res => {
      if (res && res.length) {
        setCustomersList([{ value: '', label: 'Select a customer' }, ...res.map(c => ({ value: c.id, label: c.companyName || c.contactName }))]);
      }
    }).catch(console.error);
  }, []);

  const [paymentStatus, setPaymentStatus] = useState({ paid: 0 });

  const calculateTotal = () => {
    return products.reduce((sum, p) => {
      const discountedPrice = p.price - (p.price * (p.discount / 100));
      return sum + (p.quantity * discountedPrice * (1 + (p.tax / 100)));
    }, 0);
  };

  const grandTotal = calculateTotal();
  const balanceDue = grandTotal - paymentStatus.paid;

  const handleStatusChange = (newStatus, actionText, icon, color) => {
    setStatus(newStatus);
    setActivities([
      { id: Date.now(), action: actionText, date: 'Just now', user: 'You', icon, color },
      ...activities
    ]);
  };

  const recordPayment = () => {
    navigate('/payments/create', {
      state: {
        customer: location.state?.customer || '',
        invoiceRef: 'INV-2026-006',
        amount: balanceDue
      }
    });
  };

  const handleSave = async () => {
    try {
      await addInvoice({
        clientId: Number(customer) || 1, // Fallback if none selected
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: grandTotal,
        taxAmount: 0,
        totalAmount: grandTotal,
        status: status
      });
      navigate('/invoices');
    } catch (err) {
      alert("Error saving invoice: " + err.message);
    }
  };

  const getStatusBadge = (s) => {
    const normStatus = s ? s.toUpperCase() : '';
    switch (normStatus) {
      case 'DRAFT': return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      case 'SENT': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'PAID': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  return (
    <div className="w-full pb-24 relative min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/invoices')}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-2"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Invoices
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Invoice Details</h1>
          <div className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusBadge(status)} transition-colors duration-300`}>
            {status}
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">

          {/* Payment Status Banner */}
          <Card className={`border ${balanceDue === 0 ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20' : 'border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20'}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className={`text-lg font-bold ${balanceDue === 0 ? 'text-emerald-800 dark:text-emerald-400' : 'text-indigo-800 dark:text-indigo-400'}`}>
                  {balanceDue === 0 ? 'Fully Paid' : 'Outstanding Balance'}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Total Billed: {formatCurrency(grandTotal)}</p>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${balanceDue === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                  {formatCurrency(balanceDue)}
                </p>
              </div>
            </div>
          </Card>

          {/* Customer & Invoice Information */}
          <Card>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Invoice Information</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => alert("Simulating PDF Generation...")}>
                  <Download className="w-4 h-4 mr-2" /> PDF
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleStatusChange('Sent', 'Invoice emailed to customer', Mail, 'blue')}>
                  <Mail className="w-4 h-4 mr-2" /> Email
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select label="Customer" options={customersList} value={customer} onChange={e => setCustomer(e.target.value)} />
              <Input label="Invoice Number" placeholder="INV-2026-006" defaultValue="INV-2026-006" disabled />
              <Input label="Issue Date" type="date" />
              <Input label="Due Date" type="date" />
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="w-full xl:w-80 space-y-6">

          {/* Actions Card */}
          <Card>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Actions</h2>
            <div className="space-y-3">
              {balanceDue > 0 && (
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={recordPayment}>
                  <DollarSign className="w-4 h-4 mr-2" /> Record Payment
                </Button>
              )}
              {status === 'DRAFT' && (
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleStatusChange('SENT', 'Invoice marked as sent', Send, 'blue')}>
                  <Send className="w-4 h-4 mr-2" /> Send Invoice
                </Button>
              )}
            </div>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Activity</h2>
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const Icon = activity.icon;
                const isLast = index === activities.length - 1;
                return (
                  <div key={activity.id} className="flex gap-3 relative">
                    <div className={`w-8 h-8 rounded-full bg-${activity.color}-100 dark:bg-${activity.color}-900/50 flex items-center justify-center shrink-0 z-10 ring-4 ring-white dark:ring-slate-900`}>
                      <Icon className={`w-4 h-4 text-${activity.color}-600 dark:text-${activity.color}-400`} />
                    </div>
                    {!isLast && <div className="absolute top-8 left-4 w-px h-full bg-slate-200 dark:bg-slate-700 -z-0"></div>}
                    <div className="pt-1.5 pb-4">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{activity.action}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{activity.date} by {activity.user}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <div className='flex-1 space-y-6 mt-6'>
        {/* Product Table */}
        <Card>
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Products & Services</h2>
          </div>
          <ProductTable products={products} onChange={setProducts} currency="USD" />
        </Card>

        {/* Terms & Conditions */}
        <Card>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Payment Terms</h2>
          <Textarea
            placeholder="Enter payment instructions..."
            defaultValue="Please remit payment within 15 days. Make checks payable to Acme Corp."
            rows={3}
          />
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 lg:pl-72 z-40 transition-all duration-300 flex justify-end">
        <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Save Invoice</Button>
      </div>
    </div>
  );
}
