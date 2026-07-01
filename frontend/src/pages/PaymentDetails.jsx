import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  ChevronLeft, FileText, User, Save, RefreshCcw, CheckCircle, Clock, Download, Plus, AlertCircle
} from 'lucide-react';
import Card from '../components/ui/Card';
import { useFinance } from '../context/FinanceContext';
import Button from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { invoicesApi } from '../services/api';

const methods = [
  { value: 'Credit Card', label: 'Credit Card' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Stripe', label: 'Stripe' },
  { value: 'Cash', label: 'Cash' },
];

export default function PaymentDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { recordPayment } = useFinance();
  
  // If we have an ID in the URL, we're in View/Receipt mode. Otherwise, Record mode.
  const isViewMode = !!id;

  const [status, setStatus] = useState(isViewMode ? 'Completed' : 'Draft');
  
  const [activities, setActivities] = useState([
    { 
      id: 1, 
      action: isViewMode ? 'Payment received' : 'Payment recording initiated', 
      date: isViewMode ? '2 days ago' : 'Just now', 
      user: 'You', 
      icon: isViewMode ? CheckCircle : Plus, 
      color: isViewMode ? 'emerald' : 'indigo' 
    }
  ]);

  const handleStatusChange = (newStatus, actionText, icon, color) => {
    setStatus(newStatus);
    setActivities([
      { id: Date.now(), action: actionText, date: 'Just now', user: 'You', icon, color },
      ...activities
    ]);
  };

  const [invoicesList, setInvoicesList] = useState([{ value: '', label: 'Select an invoice' }]);
  const [invoiceId, setInvoiceId] = useState(location.state?.invoiceId || '');

  React.useEffect(() => {
    invoicesApi.getAll().then(res => {
      if (res && res.length) {
        setInvoicesList([{ value: '', label: 'Select an invoice' }, ...res.map(i => ({ value: i.id, label: `${i.invoiceNumber} (${i.clientName})` }))]);
      }
    }).catch(console.error);
  }, []);

  const handleRecordPayment = async () => {
    if (!invoiceId) {
      alert("Please select an invoice before recording a payment.");
      return;
    }
    try {
      await recordPayment({
        invoiceId: Number(invoiceId),
        amount: location.state?.amount || 0,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Credit Card',
        status: 'COMPLETED'
      });
      navigate('/payments');
    } catch (err) {
      alert("Error recording payment: " + err.message);
    }
  };

  const handleRefund = () => {
    handleStatusChange('Refunded', 'Full refund issued', RefreshCcw, 'slate');
  };

  const getStatusBadge = (s) => {
    const normStatus = s ? s.toUpperCase() : '';
    switch (normStatus) {
      case 'DRAFT': return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'REFUNDED': return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="w-full pb-24 relative min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/payments')}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-2"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Payments
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isViewMode ? 'Payment Receipt' : 'Record Payment'}
          </h1>
          <div className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusBadge(status)} transition-colors duration-300`}>
            {status}
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          
          <Card>
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
               <FileText className="w-5 h-5 text-indigo-500" />
               <h2 className="text-lg font-bold text-slate-900 dark:text-white">Payment Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Invoice Reference" options={invoicesList} value={invoiceId} onChange={e => setInvoiceId(e.target.value)} disabled={isViewMode} />
              <Input label="Payment Amount" type="number" placeholder="0.00" defaultValue={location.state?.amount} disabled={isViewMode} />
              <Input label="Payment Date" type="date" disabled={isViewMode} />
              <Select label="Payment Method" options={methods} disabled={isViewMode} />
              <Input label="Transaction / Cheque Reference" placeholder="Txn-12345678" disabled={isViewMode} />
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Internal Notes</h2>
            <Textarea 
              placeholder="Notes visible only to your team..." 
              rows={3}
              disabled={isViewMode}
            />
          </Card>

          {isViewMode && status === 'Refunded' && (
             <Card className="border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
               <div className="flex items-center gap-3">
                 <AlertCircle className="w-6 h-6 text-slate-500" />
                 <div>
                   <h3 className="font-semibold text-slate-800 dark:text-slate-200">Refund Processed</h3>
                   <p className="text-sm text-slate-600 dark:text-slate-400">This payment has been fully refunded to the customer.</p>
                 </div>
               </div>
             </Card>
          )}

        </div>

        {/* Right Sidebar */}
        <div className="w-full xl:w-80 space-y-6">
          
          {/* Actions Card */}
          {isViewMode && status === 'Completed' && (
            <Card>
               <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Actions</h2>
               <div className="space-y-3">
                 <Button variant="secondary" className="w-full" onClick={() => alert("Downloading Receipt PDF...")}>
                   <Download className="w-4 h-4 mr-2" /> Download Receipt
                 </Button>
                 <Button variant="secondary" className="w-full text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30" onClick={handleRefund}>
                   <RefreshCcw className="w-4 h-4 mr-2" /> Issue Refund
                 </Button>
               </div>
            </Card>
          )}

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
      
      {!isViewMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 lg:pl-72 z-40 transition-all duration-300 flex justify-end">
           <Button onClick={handleRecordPayment}>
             <Save className="w-4 h-4 mr-2" /> Record Payment
           </Button>
        </div>
      )}
    </div>
  );
}
