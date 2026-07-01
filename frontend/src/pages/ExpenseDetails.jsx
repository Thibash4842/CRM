import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft, FileText, Save, CheckCircle, Clock, XCircle, Plus, DollarSign, Edit, Paperclip, Upload, Lock
} from 'lucide-react';
import Card from '../components/ui/Card';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import Button from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';

import { usersApi } from '../services/api';

const categories = [
  { value: 'Travel', label: 'Travel' },
  { value: 'Meals', label: 'Meals & Entertainment' },
  { value: 'Software', label: 'Software & Subscriptions' },
  { value: 'Office Supplies', label: 'Office Supplies' },
  { value: 'Training', label: 'Training & Development' },
];

export default function ExpenseDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addExpense } = useFinance();
  const { showToast } = useToast();
  const { user } = useAuth();
  
  const isViewMode = !!id;
  const [status, setStatus] = useState(isViewMode ? 'PENDING_APPROVAL' : 'DRAFT');

  const [employee, setEmployee] = useState('');
  const [usersList, setUsersList] = useState([{ value: '', label: 'Select Employee' }]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Travel');
  const [vendor, setVendor] = useState('');

  React.useEffect(() => {
    usersApi.getAll().then(res => {
      if (res && res.length) {
        setUsersList([{ value: '', label: 'Select Employee' }, ...res.map(u => ({ value: u.id, label: u.firstName + ' ' + u.lastName }))]);
      }
    }).catch(console.error);
  }, []);
  
  const [activities, setActivities] = useState([
    { 
      id: 1, 
      action: isViewMode ? 'Expense submitted' : 'Expense created', 
      date: isViewMode ? '2 days ago' : 'Just now', 
      user: 'You', 
      icon: Plus, 
      color: 'slate' 
    }
  ]);
  
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleStatusChange = (newStatus, actionText, icon, color) => {
    setStatus(newStatus);
    setActivities([
      { id: Date.now(), action: actionText, date: 'Just now', user: 'You', icon, color },
      ...activities
    ]);
    showToast(`Expense marked as ${newStatus}`, 'success');
  };

  const handleSaveDraft = () => {
    showToast('Draft saved successfully', 'success');
  };

  useKeyboardShortcut(['ctrl+s', 'cmd+s'], () => {
    if (status === 'Draft') {
      handleSaveDraft();
    }
  });

  const getStatusBadge = (s) => {
    const normStatus = s ? s.toUpperCase() : '';
    switch (normStatus) {
      case 'DRAFT': return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      case 'PENDING_APPROVAL': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'APPROVED': return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800';
      case 'REIMBURSED': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files.map(f => f.name)]);
    }
  };

  return (
    <div className="w-full pb-24 relative min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/expenses')}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-2"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Expenses
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isViewMode ? 'Expense Details' : 'Record Expense'}
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
               <h2 className="text-lg font-bold text-slate-900 dark:text-white">Expense Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Employee" options={usersList} value={employee} onChange={e => setEmployee(e.target.value)} disabled={status !== 'DRAFT'} />
              <Input label="Expense Date" type="date" disabled={status !== 'DRAFT'} />
              <Select label="Category" options={categories} value={category} onChange={e => setCategory(e.target.value)} disabled={status !== 'DRAFT'} />
              <Input label="Vendor / Merchant" placeholder="e.g. Delta Airlines" value={vendor} onChange={e => setVendor(e.target.value)} disabled={status !== 'DRAFT'} />
              <Input label="Expense Amount" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} disabled={status !== 'DRAFT'} />
              <Input label="Expense ID" placeholder="EXP-2026-006" defaultValue="EXP-2026-006" disabled />
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Description & Justification</h2>
            <Textarea 
              placeholder="Provide a detailed description of this expense..." 
              rows={3}
              disabled={status !== 'Draft'}
            />
          </Card>

          <Card>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Receipt Upload</h2>
            
            {status === 'Draft' ? (
              <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/20 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={handleFileUpload}
                  multiple
                />
                <Upload className="w-8 h-8 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Click or drag receipt files to attach</p>
                <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG, PDF (Max 10MB)</p>
              </div>
            ) : null}

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <Paperclip className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{file}</span>
                  </div>
                ))}
              </div>
            )}
            {uploadedFiles.length === 0 && status !== 'Draft' && (
              <p className="text-sm text-slate-500">No receipts attached.</p>
            )}
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="w-full xl:w-80 space-y-6">
          
          {/* Approval Status Card */}
          <Card>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Status</h2>
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
                  <p className="text-xs text-red-600 dark:text-red-500">Expense declined</p>
                </div>
              </div>
            ) : status === 'Approved' ? (
              <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
                <div>
                  <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-400">Approved</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-500">Awaiting reimbursement</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">Reimbursed</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500">Funds transferred</p>
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
        </div>
      </div>
      
      {/* Sticky Footer Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 lg:pl-72 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 hidden sm:block">
            Status: <span className="font-semibold text-slate-700 dark:text-slate-300">{status}</span>
          </p>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            
            {status === 'DRAFT' && (
              <>
                <Button variant="secondary" className="flex-1 sm:flex-none">
                  <Save className="w-4 h-4 mr-2" /> Save Draft
                </Button>
                <Button className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white" onClick={async () => {
                  try {
                    await addExpense({
                      employeeId: Number(employee) || 1,
                      category: category || 'Travel',
                      vendor: vendor || 'Acme Vendor',
                      date: new Date().toISOString().split('T')[0],
                      amount: amount || 150.00,
                      status: 'PENDING_APPROVAL'
                    });
                    handleStatusChange('PENDING_APPROVAL', 'Submitted for approval', Clock, 'yellow');
                    navigate('/expenses');
                  } catch (err) {
                    alert("Error saving expense: " + err.message);
                  }
                }}>
                  Submit for Approval
                </Button>
              </>
            )}

            {status === 'PENDING_APPROVAL' && (
              <>
                <Button variant="secondary" className="flex-1 sm:flex-none text-red-600 hover:text-red-700" onClick={() => handleStatusChange('REJECTED', 'Expense rejected', XCircle, 'red')}>
                  <XCircle className="w-4 h-4 mr-2" /> Reject
                </Button>
                {user?.role === 'admin' ? (
                  <Button className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => handleStatusChange('APPROVED', 'Expense approved', CheckCircle, 'indigo')}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                  </Button>
                ) : (
                  <Button disabled className="flex-1 sm:flex-none bg-slate-300 text-slate-500 cursor-not-allowed relative group">
                    <Lock className="w-4 h-4 mr-2" /> Approve
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block w-max px-2 py-1 bg-slate-800 text-white text-xs rounded shadow-lg pointer-events-none">
                      Requires Admin Role
                    </div>
                  </Button>
                )}
              </>
            )}

            {status === 'APPROVED' && (
              <>
                <Button className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleStatusChange('REIMBURSED', 'Expense reimbursed to employee', DollarSign, 'emerald')}>
                  <DollarSign className="w-4 h-4 mr-2" /> Mark as Reimbursed
                </Button>
              </>
            )}

            {(status === 'REIMBURSED' || status === 'REJECTED') && (
              <Button variant="secondary" className="flex-1 sm:flex-none text-slate-700 hover:bg-slate-100">
                <FileText className="w-4 h-4 mr-2" /> View Audit Trail
              </Button>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
