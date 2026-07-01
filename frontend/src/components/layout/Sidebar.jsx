import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Target, Handshake, Building2,
  FolderKanban, FileText, CreditCard, BarChart3, Settings,
  ChevronDown, ChevronRight, Sparkles, X, Megaphone, Mail,
  CheckSquare, Flag, DollarSign, Headphones, BookOpen, Zap,
  TrendingUp, TrendingDown, LineChart, Shield, Key, Lock,
  Clock, Cloud, Package, Repeat, Calendar, Activity, Ticket,
  Phone, Users as UsersIcon, StickyNote, CheckCircle, XCircle, Trash2, MoreVertical, Bell
} from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  // { path: '/notifications', icon: Bell, label: 'Notifications' },
  {
    label: 'CRM',
    icon: Users,
    children: [
      {
        label: 'Lead Management',
        icon: Target,
        path: '/leads',
        popover: [
          { path: '/leads', icon: Target, label: 'Active Leads' },
          { path: '/leads/converted', icon: CheckCircle, label: 'Converted Leads' },
          { path: '/leads/trash', icon: Trash2, label: 'Lost Leads' },
        ],
      },
      { path: '/contacts', icon: Users, label: 'Contacts' },
      { path: '/accounts', icon: Building2, label: 'Accounts' },
      { path: '/deals', icon: Handshake, label: 'Deals' },
      {
        label: 'Activities',
        icon: Activity,
        children: [
          { path: '/activities/tasks', icon: CheckSquare, label: 'Tasks' },
          { path: '/activities/calls', icon: Phone, label: 'Calls' },
          { path: '/activities/meetings', icon: UsersIcon, label: 'Meetings' },
          { path: '/activities/follow-ups', icon: Clock, label: 'Follow-ups' },
        ],
      },
      { path: '/notes', icon: StickyNote, label: 'Notes' },
      { path: '/calendar', icon: Calendar, label: 'Calendar' },
    ],
  },
  {
    label: 'Marketing',
    icon: Megaphone,
    children: [
      { path: '/campaigns', icon: Megaphone, label: 'Campaigns' },
      { path: '/forms', icon: FileText, label: 'Forms' },
      { path: '/email-marketing', icon: Mail, label: 'Email Marketing' },
    ],
  },
  {
    label: 'Projects',
    icon: FolderKanban,
    children: [
      { path: '/projects', icon: FolderKanban, label: 'Projects' },
      { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
      { path: '/milestones', icon: Flag, label: 'Milestones' },
    ],
  },
  { path: '/quotes', icon: FileText, label: 'Quotes' },
  {
    label: 'Finance',
    icon: DollarSign,
    children: [
      { path: '/invoices', icon: FileText, label: 'Invoices' },
      { path: '/payments', icon: CreditCard, label: 'Payments' },
      { path: '/expenses', icon: TrendingDown, label: 'Expenses' },
    ],
  },
  {
    label: 'Support',
    icon: Headphones,
    children: [
      { path: '/tickets', icon: Ticket, label: 'Tickets' },
      { path: '/knowledge-base', icon: BookOpen, label: 'Knowledge Base' },
    ],
  },
  {
    label: 'Reports',
    icon: BarChart3,
    children: [
      { path: '/sales-reports', icon: TrendingUp, label: 'Sales Reports' },
      { path: '/revenue-reports', icon: DollarSign, label: 'Revenue Reports' },
      { path: '/forecasts', icon: LineChart, label: 'Forecasts' },
    ],
  },
  {
    label: 'Automation',
    icon: Zap,
    children: [
      { path: '/workflows', icon: Zap, label: 'Workflows' },
      { path: '/rules', icon: Settings, label: 'Rules' },
    ],
  },
  {
    label: 'Administration',
    icon: Shield,
    children: [
      { path: '/users', icon: Users, label: 'Users' },
      { path: '/roles', icon: Key, label: 'Roles' },
      { path: '/permissions', icon: Lock, label: 'Permissions' },
      { path: '/audit-logs', icon: Clock, label: 'Audit Logs' },
    ],
  },
  {
    label: 'SaaS',
    icon: Cloud,
    children: [
      { path: '/tenants', icon: Building2, label: 'Tenants' },
      { path: '/plans', icon: Package, label: 'Plans' },
      { path: '/subscriptions', icon: Repeat, label: 'Subscriptions' },
    ],
  },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState([]);
  const [activePopover, setActivePopover] = useState(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  const toggleExpand = (label) => {
    setExpanded((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isChildActive = (children) =>
    children?.some((c) => location.pathname === c.path);

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 glass border-r border-slate-200/50 dark:border-slate-700/50 transform transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl gradient-primary">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">ScratchIO</h1>
              <p className="text-xs text-slate-500">CRM Platform</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-88px)]">
          {menuItems.map((item) => {
            if (item.children) {
              const isExpanded = expanded.includes(item.label);
              const hasActiveChild = isChildActive(item.children);
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={`sidebar-link w-full ${hasActiveChild ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 animate-slide-in">
                      {item.children.map((child) => {
                        // Check if child has nested children
                        if (child.children) {
                          const childExpanded = expanded.includes(child.label);
                          const childHasActiveChild = isChildActive(child.children);
                          return (
                            <div key={child.label}>
                              <button
                                onClick={() => toggleExpand(child.label)}
                                className={`sidebar-link w-full text-sm ${childHasActiveChild ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
                              >
                                <child.icon className="w-4 h-4" />
                                <span className="flex-1 text-left">{child.label}</span>
                                {childExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                              </button>
                              {childExpanded && (
                                <div className="ml-4 mt-1 space-y-1 animate-slide-in">
                                  {child.children.map((grandchild) => (
                                    <NavLink
                                      key={grandchild.path}
                                      to={grandchild.path}
                                      onClick={onClose}
                                      className={({ isActive }) =>
                                        `sidebar-link text-xs ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
                                      }
                                    >
                                      <grandchild.icon className="w-4 h-4" />
                                      {grandchild.label}
                                    </NavLink>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }

                        // Check if child has a popover
                        if (child.popover) {
                          const childHasActiveChild = child.popover.some(p => location.pathname === p.path);
                          return (
                            <div key={child.label} className="relative">
                              <div className={`flex items-center w-full rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${childHasActiveChild ? 'bg-slate-50 dark:bg-slate-800/50 text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                <NavLink
                                  to={child.path}
                                  onClick={onClose}
                                  className="flex items-center gap-3 py-2 px-3 flex-1 text-sm font-medium"
                                >
                                  <child.icon className="w-4 h-4" />
                                  <span className="flex-1 text-left">{child.label}</span>
                                </NavLink>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (activePopover === child.label) {
                                      setActivePopover(null);
                                    } else {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setPopoverPos({ top: rect.top, left: rect.right + 8 });
                                      setActivePopover(child.label);
                                    }
                                  }}
                                  className="p-1.5 mr-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>

                              {activePopover === child.label && createPortal(
                                <>
                                  <div className="fixed inset-0 z-[60]" onClick={() => setActivePopover(null)} />
                                  <div
                                    className="fixed bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-[70] animate-fade-in w-56"
                                    style={{ top: popoverPos.top, left: popoverPos.left }}
                                  >
                                    {child.popover.map((popItem) => (
                                      <NavLink
                                        key={popItem.path}
                                        to={popItem.path}
                                        onClick={() => { setActivePopover(null); onClose(); }}
                                        className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${isActive ? 'text-blue-600 font-medium bg-blue-50 dark:bg-blue-900/20' : 'text-slate-700 dark:text-slate-300'}`}
                                      >
                                        <popItem.icon className="w-4 h-4" />
                                        {popItem.label}
                                      </NavLink>
                                    ))}
                                  </div>
                                </>,
                                document.body
                              )}
                            </div>
                          );
                        }

                        // Regular child with path
                        return (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            onClick={onClose}
                            className={({ isActive }) =>
                              `sidebar-link text-sm ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
                            }
                          >
                            <child.icon className="w-4 h-4" />
                            {child.label}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
