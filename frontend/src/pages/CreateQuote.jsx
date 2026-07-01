import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft, Plus, Trash2, Paperclip,
  CheckCircle, Clock, Save, FileText, Send, User, MessageSquare, Edit, Eye, XCircle, FileOutput
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import ProductTable from '../components/ui/ProductTable';

import { clientsApi, usersApi } from '../services/api';

const currencies = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' }
];

export default function CreateQuote() {
  const navigate = useNavigate();
  const location = useLocation();
  const editQuote = location.state?.quote;

  const { addQuote } = useFinance();
  const [customer, setCustomer] = useState(editQuote?.clientId || '');
  const [owner, setOwner] = useState(editQuote?.ownerId || '');
  const [customersList, setCustomersList] = useState([{ value: '', label: 'Select a customer' }]);
  const [usersList, setUsersList] = useState([{ value: '', label: 'Select an owner' }]);

  const [products, setProducts] = useState(editQuote?.products || [
    { id: 1, name: '', description: '', quantity: 1, price: 0, discount: 0, tax: 0 }
  ]);

  const [status, setStatus] = useState(editQuote?.status || 'Draft');
  const [activities, setActivities] = useState([
    { id: 1, action: 'Quote created', date: 'Just now', user: 'You', icon: Plus, color: 'indigo' }
  ]);

  React.useEffect(() => {
    clientsApi.getAll().then(res => {
      if (res && res.length) {
        setCustomersList([{ value: '', label: 'Select a customer' }, ...res.map(c => ({ value: c.id, label: c.companyName || c.contactName }))]);
      }
    }).catch(console.error);

    usersApi.getAll().then(res => {
      if (res && res.length) {
        setUsersList([{ value: '', label: 'Select an owner' }, ...res.map(u => ({ value: u.id, label: u.firstName + ' ' + u.lastName }))]);
      }
    }).catch(console.error);
  }, []);

  const handleStatusChange = (newStatus, actionText, icon, color) => {
    setStatus(newStatus);
    setActivities([
      { id: Date.now(), action: actionText, date: 'Just now', user: 'You', icon, color },
      ...activities
    ]);
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'Draft': return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      case 'Pending Approval': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'Approved': return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800';
      case 'Sent': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'Viewed': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
      case 'Accepted': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'Expired': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const handleSave = async (finalStatus) => {
    try {
      const totalAmount = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
      await addQuote({
        clientId: Number(customer) || 1,
        ownerId: Number(owner) || 1,
        amount: totalAmount,
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: finalStatus || status.toUpperCase().replace(' ', '_')
      });
      navigate('/quotes');
    } catch (err) {
      alert("Error saving quote: " + err.message);
    }
  };

  return (
    <div className="w-full pb-20 relative min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/quotes')}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-2"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Quotes
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Quote</h1>
          <div className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusBadge(status)} transition-colors duration-300`}>
            {status}
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">

          {/* Customer Information */}
          <Card>
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <User className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Customer Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Customer" options={customersList} value={customer} onChange={(e) => setCustomer(e.target.value)} />
              <Input label="Contact Person" placeholder="John Doe" />
              <Input label="Email Address" type="email" placeholder="john@example.com" />
              <Input label="Billing Address" placeholder="123 Business St, City" />
            </div>
          </Card>

          {/* Quote Information */}
          <Card>
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <FileText className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quote Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input label="Quote Number" placeholder="QT-2026-006" defaultValue="QT-2026-006" disabled />
              <Input label="Issue Date" type="date" />
              <Input label="Expiry Date" type="date" />
              <Select label="Currency" options={currencies} />
              <Select label="Owner" options={usersList} value={owner} onChange={(e) => setOwner(e.target.value)} />
              <Input label="Reference / PO" placeholder="Optional reference" />
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="w-full xl:w-80 space-y-6">

          {/* Approval Status */}
          <Card>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Approval Status</h2>
            {status === 'Draft' ? (
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                <Edit className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Draft</p>
                  <p className="text-xs text-slate-500">Not yet submitted</p>
                </div>
              </div>
            ) : status === 'Pending Approval' ? (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-xl">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-400">Pending Approval</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-500">Requires manager review</p>
                </div>
              </div>
            ) : status === 'Rejected' ? (
              <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
                <div>
                  <p className="text-sm font-semibold text-red-800 dark:text-red-400">Rejected</p>
                  <p className="text-xs text-red-600 dark:text-red-500">Please revise</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
                <div>
                  <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-400">Approved</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-500">Ready to send</p>
                </div>
              </div>
            )}
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

          {/* Comments */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Comments</h2>
            </div>
            <div className="space-y-4">
              <div className="text-center py-6">
                <p className="text-sm text-slate-500">No comments yet.</p>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Add a comment..." className="flex-1" />
                <Button size="sm" variant="secondary" className="px-3">Post</Button>
              </div>
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
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Terms & Conditions</h2>
          <Textarea
            placeholder="Enter the terms and conditions for this quote..."
            defaultValue="1. This quote is valid for 30 days.&#10;2. Payment is due within 15 days of invoice date.&#10;3. All prices are in USD."
            rows={4}
          />
        </Card>

        {/* Internal Notes */}
        <Card>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Internal Notes</h2>
          <Textarea
            placeholder="Notes visible only to your team..."
            rows={3}
          />
        </Card>

        {/* Attachments */}
        <Card>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Attachments</h2>
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/20 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors cursor-pointer">
            <Paperclip className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Click or drag files to attach</p>
            <p className="text-xs text-slate-500 mt-1">Maximum file size 25MB</p>
          </div>
        </Card>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 lg:pl-72 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 hidden sm:block">
            Status: <span className="font-semibold text-slate-700 dark:text-slate-300">{status}</span>
          </p>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">

            {status === 'Draft' && (
              <>
                <Button variant="secondary" className="flex-1 sm:flex-none" onClick={() => handleSave('DRAFT')}>
                  <Save className="w-4 h-4 mr-2" /> Save Draft
                </Button>
                <Button className="flex-1 sm:flex-none bg-yellow-600 hover:bg-yellow-700 text-white" onClick={() => {
                  handleStatusChange('Pending Approval', 'Requested approval', Clock, 'yellow');
                  handleSave('PENDING_APPROVAL');
                }}>
                  Request Approval
                </Button>
              </>
            )}

            {status === 'Pending Approval' && (
              <>
                <Button variant="secondary" className="flex-1 sm:flex-none text-red-600 hover:text-red-700" onClick={() => handleStatusChange('Rejected', 'Approval rejected', XCircle, 'red')}>
                  <XCircle className="w-4 h-4 mr-2" /> Reject
                </Button>
                <Button className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => handleStatusChange('Approved', 'Quote approved', CheckCircle, 'indigo')}>
                  <CheckCircle className="w-4 h-4 mr-2" /> Approve
                </Button>
              </>
            )}

            {(status === 'Approved' || status === 'Rejected') && (
              <>
                <Button variant="secondary" className="flex-1 sm:flex-none" onClick={() => handleStatusChange('Draft', 'Reverted to draft', Edit, 'slate')}>
                  <Edit className="w-4 h-4 mr-2" /> Revise Quote
                </Button>
                {status === 'Approved' && (
                  <Button className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleStatusChange('Sent', 'Sent to customer', Send, 'blue')}>
                    <Send className="w-4 h-4 mr-2" /> Send Quote
                  </Button>
                )}
              </>
            )}

            {status === 'Sent' && (
              <Button className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white" onClick={() => handleStatusChange('Viewed', 'Customer viewed quote', Eye, 'purple')}>
                <Eye className="w-4 h-4 mr-2" /> Simulate View
              </Button>
            )}

            {status === 'Viewed' && (
              <>
                <Button variant="secondary" className="flex-1 sm:flex-none text-red-600 hover:text-red-700" onClick={() => handleStatusChange('Rejected', 'Customer rejected', XCircle, 'red')}>
                  <XCircle className="w-4 h-4 mr-2" /> Customer Reject
                </Button>
                <Button className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleStatusChange('Accepted', 'Customer accepted quote', CheckCircle, 'emerald')}>
                  <CheckCircle className="w-4 h-4 mr-2" /> Customer Accept
                </Button>
              </>
            )}

            {(status === 'Accepted' || status === 'Rejected' || status === 'Expired') && (
              <Button variant="secondary" className="flex-1 sm:flex-none text-slate-700 hover:bg-slate-100">
                <FileText className="w-4 h-4 mr-2" /> View PDF
              </Button>
            )}

            {status === 'Accepted' && (
              <Button className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white" onClick={async () => {
                const totalAmount = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
                try {
                  await addQuote({
                    clientId: Number(customer) || 1,
                    ownerId: Number(owner) || 1,
                    amount: totalAmount,
                    issueDate: new Date().toISOString().split('T')[0],
                    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    status: 'ACCEPTED'
                  });
                  navigate('/invoices/create', { state: { products, customer: customer || '1' } });
                } catch (err) {
                  alert("Error converting quote: " + err.message);
                }
              }}>
                <FileOutput className="w-4 h-4 mr-2" /> Convert to Invoice
              </Button>
            )}

            {status !== 'Accepted' && status !== 'Expired' && status !== 'Rejected' && (
              <Button variant="secondary" className="flex-1 sm:flex-none" onClick={() => handleStatusChange('Expired', 'Quote expired', Clock, 'orange')}>
                Mark as Expired
              </Button>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
