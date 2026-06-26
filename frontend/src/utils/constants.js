export const LEAD_STATUSES = [
  { value: 'NEW', label: 'New', color: 'bg-blue-500' },
  { value: 'CONTACTED', label: 'Contacted', color: 'bg-orange-500' },
  { value: 'MEETING', label: 'Meeting', color: 'bg-purple-500' },
  { value: 'FOLLOW_UP', label: 'Follow Up', color: 'bg-amber-500' },
  { value: 'PROPOSAL_SENT', label: 'Proposal Sent', color: 'bg-indigo-500' },
  { value: 'WON', label: 'Won', color: 'bg-emerald-500' },
  { value: 'LOST', label: 'Lost', color: 'bg-red-500' },
];

export const DEAL_STAGES = [
  { value: 'QUALIFICATION', label: 'Qualification', color: 'bg-slate-500' },
  { value: 'DISCOVERY', label: 'Discovery', color: 'bg-indigo-500' },
  { value: 'PROPOSAL', label: 'Proposal', color: 'bg-blue-500' },
  { value: 'NEGOTIATION', label: 'Negotiation', color: 'bg-amber-500' },
  { value: 'WON', label: 'Won', color: 'bg-emerald-500' },
  { value: 'LOST', label: 'Lost', color: 'bg-red-500' },
];

export const PROJECT_STATUSES = [
  { value: 'PLANNING', label: 'Planning', color: 'bg-slate-500' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-emerald-500' },
  { value: 'ON_HOLD', label: 'On Hold', color: 'bg-amber-500' },
];

export const INVOICE_STATUSES = [
  { value: 'DRAFT', label: 'Draft', color: 'bg-slate-500' },
  { value: 'SENT', label: 'Sent', color: 'bg-blue-500' },
  { value: 'PAID', label: 'Paid', color: 'bg-emerald-500' },
  { value: 'OVERDUE', label: 'Overdue', color: 'bg-red-500' },
];

export const TASK_PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'text-slate-500' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-blue-500' },
  { value: 'HIGH', label: 'High', color: 'text-amber-500' },
  { value: 'URGENT', label: 'Urgent', color: 'text-red-500' },
];

export const TASK_STATUSES = [
  { value: 'PENDING', label: 'Pending', color: 'bg-slate-500' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-emerald-500' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-500' },
];

export const LEAD_SOURCES = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Trade Show', 'Email Campaign', 'Other'];

export const ROLES = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'SALES_EXECUTIVE', label: 'Sales Executive' },
];

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
}

export function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(date) {
  if (!date) return '-';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function getStatusBadge(status, list) {
  const item = list.find((s) => s.value === status);
  return item || { label: status, color: 'bg-slate-500' };
}
