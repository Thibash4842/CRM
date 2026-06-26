import { Settings, Bell, Building2, Users, Key, Users2, Cog, Target, Handshake, FolderKanban, FileText, CreditCard, Zap, Mail, Layers, Tag, File, Lock as LockIcon, Clock, Repeat, Globe, HardDrive, KeyRound, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const settingsCategories = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'roles', label: 'Roles & Permissions', icon: Key },
  { id: 'teams', label: 'Teams', icon: Users2 },
  { id: 'crm-config', label: 'CRM Configuration', icon: Cog },
  { id: 'lead-settings', label: 'Lead Settings', icon: Target },
  { id: 'deal-pipeline', label: 'Deal Pipeline', icon: Handshake },
  { id: 'project-settings', label: 'Project Settings', icon: FolderKanban },
  { id: 'invoice-settings', label: 'Invoice Settings', icon: FileText },
  { id: 'payment-settings', label: 'Payment Settings', icon: CreditCard },
  { id: 'workflow-automation', label: 'Workflow Automation', icon: Zap },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'email-config', label: 'Email Configuration', icon: Mail },
  { id: 'integrations', label: 'Integrations', icon: Layers },
  { id: 'custom-fields', label: 'Custom Fields', icon: Cog },
  { id: 'tags', label: 'Tags', icon: Tag },
  { id: 'documents', label: 'Documents', icon: File },
  { id: 'security', label: 'Security', icon: LockIcon },
  { id: 'audit-logs', label: 'Audit Logs', icon: Clock },
  { id: 'subscription', label: 'Subscription & Billing', icon: Repeat },
  { id: 'localization', label: 'Localization', icon: Globe },
  { id: 'backup', label: 'Backup & Restore', icon: HardDrive },
  { id: 'api-management', label: 'API Management', icon: KeyRound },
];

const settingsContent = {
  general: {
    title: 'General Settings',
    description: 'Basic application settings and preferences',
    items: [
      { label: 'Application Name', description: 'ScratchIO CRM' },
      { label: 'Timezone', description: 'UTC (Coordinated Universal Time)' },
      { label: 'Date Format', description: 'MM/DD/YYYY' },
    ],
  },
  company: {
    title: 'Company Information',
    description: 'Manage your company details',
    items: [
      { label: 'Company Name', description: 'Your Organization' },
      { label: 'Website', description: 'https://company.com' },
      { label: 'Logo', description: 'Upload company logo' },
      { label: 'Contact Email', description: 'contact@company.com' },
    ],
  },
  users: {
    title: 'User Management',
    description: 'Add, edit, or remove users',
    items: [
      { label: 'Active Users', description: '12 users' },
      { label: 'Pending Invitations', description: '2 pending' },
      { label: 'User Licenses', description: '15/20 used' },
    ],
  },
  roles: {
    title: 'Roles & Permissions',
    description: 'Define user roles and access levels',
    items: [
      { label: 'Administrator', description: 'Full system access' },
      { label: 'Sales Manager', description: 'Sales and reporting access' },
      { label: 'Support Agent', description: 'Support ticket access' },
      { label: 'Custom Roles', description: 'Create custom roles' },
    ],
  },
  teams: {
    title: 'Teams',
    description: 'Manage team assignments and hierarchies',
    items: [
      { label: 'Teams Created', description: '5 teams' },
      { label: 'Team Assignments', description: 'Configure team members' },
    ],
  },
  'crm-config': {
    title: 'CRM Configuration',
    description: 'Configure core CRM settings',
    items: [
      { label: 'Lead Scoring', description: 'Configure lead scoring rules' },
      { label: 'Deal Stages', description: 'Manage deal pipeline stages' },
      { label: 'Activity Types', description: 'Define activity categories' },
    ],
  },
  'lead-settings': {
    title: 'Lead Settings',
    description: 'Customize lead management settings',
    items: [
      { label: 'Lead Sources', description: 'Define lead origin sources' },
      { label: 'Lead Status', description: 'Configure lead statuses' },
      { label: 'Auto-assignment Rules', description: 'Set up lead routing' },
    ],
  },
  'deal-pipeline': {
    title: 'Deal Pipeline',
    description: 'Configure deal stages and workflow',
    items: [
      { label: 'Pipeline Stages', description: 'Prospecting, Proposal, Closing' },
      { label: 'Win/Loss Analysis', description: 'Track deal outcomes' },
      { label: 'Probability Settings', description: 'Configure success rates' },
    ],
  },
  'project-settings': {
    title: 'Project Settings',
    description: 'Manage project configuration',
    items: [
      { label: 'Project Templates', description: 'Create reusable templates' },
      { label: 'Task Priorities', description: 'Define priority levels' },
      { label: 'Project Statuses', description: 'Configure project states' },
    ],
  },
  'invoice-settings': {
    title: 'Invoice Settings',
    description: 'Configure invoicing options',
    items: [
      { label: 'Invoice Numbering', description: 'Auto-increment settings' },
      { label: 'Terms & Conditions', description: 'Default invoice terms' },
      { label: 'Tax Configuration', description: 'Tax rate management' },
    ],
  },
  'payment-settings': {
    title: 'Payment Settings',
    description: 'Configure payment processing',
    items: [
      { label: 'Payment Methods', description: 'Enable payment gateways' },
      { label: 'Currency', description: 'USD - US Dollar' },
      { label: 'Payment Terms', description: 'Net 30, Net 60 options' },
    ],
  },
  'workflow-automation': {
    title: 'Workflow Automation',
    description: 'Set up automated workflows',
    items: [
      { label: 'Trigger Rules', description: 'Create automation triggers' },
      { label: 'Action Sequences', description: 'Define workflow actions' },
      { label: 'Active Workflows', description: '8 workflows running' },
    ],
  },
  notifications: {
    title: 'Notifications',
    description: 'Manage notification preferences',
    items: [
      { label: 'Email Notifications', description: 'Receive email alerts', action: 'toggle' },
      { label: 'In-App Notifications', description: 'Browser notifications', action: 'toggle' },
      { label: 'Task Reminders', description: 'Reminder settings', action: 'toggle' },
    ],
  },
  'email-config': {
    title: 'Email Configuration',
    description: 'Set up email services',
    items: [
      { label: 'SMTP Server', description: 'smtp.gmail.com' },
      { label: 'Email Template', description: 'Customize email templates' },
      { label: 'Send Test Email', description: 'Test email configuration' },
    ],
  },
  integrations: {
    title: 'Integrations',
    description: 'Manage third-party integrations',
    items: [
      { label: 'Slack', description: 'Connect to Slack workspace' },
      { label: 'Google Workspace', description: 'Sync Google contacts' },
      { label: 'Zapier', description: 'Automated workflows' },
    ],
  },
  'custom-fields': {
    title: 'Custom Fields',
    description: 'Create and manage custom fields',
    items: [
      { label: 'Lead Custom Fields', description: '5 custom fields' },
      { label: 'Deal Custom Fields', description: '3 custom fields' },
      { label: 'Contact Custom Fields', description: '4 custom fields' },
    ],
  },
  tags: {
    title: 'Tags',
    description: 'Manage tags and categories',
    items: [
      { label: 'Available Tags', description: '25 tags configured' },
      { label: 'Create New Tags', description: 'Add custom tags' },
      { label: 'Tag Groups', description: 'Organize tags by group' },
    ],
  },
  documents: {
    title: 'Documents',
    description: 'Manage document storage',
    items: [
      { label: 'Document Templates', description: 'Create reusable templates' },
      { label: 'Storage Limit', description: '5 GB / 10 GB used' },
      { label: 'Document Retention', description: 'Set archival policies' },
    ],
  },
  security: {
    title: 'Security',
    description: 'Manage security settings',
    items: [
      { label: 'Two-Factor Authentication', description: 'Enable 2FA', action: 'toggle' },
      { label: 'Password Policy', description: 'Enforce strong passwords' },
      { label: 'Session Timeout', description: '30 minutes' },
    ],
  },
  'audit-logs': {
    title: 'Audit Logs',
    description: 'View system activity logs',
    items: [
      { label: 'System Logs', description: 'Recent activity: 150 entries' },
      { label: 'User Actions', description: 'Track user activities' },
      { label: 'Export Logs', description: 'Download audit reports' },
    ],
  },
  subscription: {
    title: 'Subscription & Billing',
    description: 'Manage subscription and billing',
    items: [
      { label: 'Current Plan', description: 'Professional Plan' },
      { label: 'Billing Period', description: 'Monthly - $299/month' },
      { label: 'Payment Method', description: 'Visa ending in 4242' },
      { label: 'Renewal Date', description: 'July 16, 2026' },
    ],
  },
  localization: {
    title: 'Localization',
    description: 'Set language and regional settings',
    items: [
      { label: 'Language', description: 'English' },
      { label: 'Region', description: 'United States' },
      { label: 'Currency', description: 'USD' },
    ],
  },
  backup: {
    title: 'Backup & Restore',
    description: 'Manage data backups',
    items: [
      { label: 'Last Backup', description: 'June 16, 2026 10:30 AM' },
      { label: 'Auto Backup', description: 'Daily backups enabled' },
      { label: 'Restore Data', description: 'Restore from previous backup' },
    ],
  },
  'api-management': {
    title: 'API Management',
    description: 'Manage API keys and access',
    items: [
      { label: 'API Keys', description: '2 active keys' },
      { label: 'Rate Limits', description: '1000 requests/hour' },
      { label: 'API Documentation', description: 'View API docs' },
    ],
  },
};

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState('general');

  const currentContent = settingsContent[activeCategory];
  const currentCategory = settingsCategories.find(cat => cat.id === activeCategory);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="w-7 h-7" /> Settings</h1>
        <p className="text-slate-500 mt-1">Manage your application settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="glass rounded-lg border border-slate-200/50 dark:border-slate-700/50 p-4 sticky top-20 max-h-[calc(100vh-120px)] flex flex-col">
            <h3 className="font-semibold text-sm mb-4 text-slate-600 dark:text-slate-400">Settings</h3>
            <nav className="space-y-1 overflow-y-auto flex-1">
              {settingsCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      activeCategory === category.id
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left truncate">{category.label}</span>
                    {activeCategory === category.id && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="flex flex-col max-h-[calc(100vh-120px)]">
            <div className="flex items-center gap-3 mb-6 flex-shrink-0">
              {currentCategory && <currentCategory.icon className="w-6 h-6 text-indigo-500" />}
              <div>
                <h2 className="text-xl font-bold">{currentContent.title}</h2>
                <p className="text-sm text-slate-500">{currentContent.description}</p>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                {currentContent.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                    {item.action === 'toggle' && (
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-indigo-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-3 flex-shrink-0 border-t border-slate-200 dark:border-slate-700 pt-6">
              <Button variant="primary">Save Changes</Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
