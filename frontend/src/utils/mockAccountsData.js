export const ACCOUNTS_MOCK_DATA = [
  {
    id: 'acc_1',
    name: 'Innovate IO',
    logo: 'IO',
    industry: 'Technology',
    website: 'www.innovate.io',
    phone: '+1 (555) 123-4567',
    email: 'contact@innovate.io',
    address: '120 Innovation Drive, San Francisco, CA 94105',
    customerSince: '2023-01-15',
    foundedYear: 2018,
    taxId: 'US-987654321',
    owner: 'Emily Rodriguez',
    territory: 'North America - West',
    type: 'Customer', // Customer, Prospect, Partner, Vendor
    segment: 'Enterprise',
    status: 'Healthy', // Healthy, Needs Attention, At Risk
    healthScore: 92,
    revenue: 12500000,
    employeeCount: '500-1000',
    openDealsCount: 3,
    closedDealsCount: 12,
    totalOpportunityValue: 850000,
    activeContacts: 14,
    meetingsThisMonth: 4,
    lastActivity: '2 hours ago',
    lastMeeting: '2026-06-12',
    renewalDate: '2027-01-15',
    ltv: 2500000,
    churnRisk: 5, // Percentage
    upsellProbability: 85, // Percentage
    renewalProbability: 95, // Percentage
    description: 'Leading provider of cloud infrastructure and DevOps automation tools for enterprise clients.',
    
    // AI Insights
    aiSummary: "Innovate IO has generated $12.5M in revenue this year with an LTV of $2.5M. Customer engagement is exceptional, scoring 92/100. There are 3 active expansion opportunities in the pipeline worth $850k. Renewal is on track for January 2027.",
    aiRecommendations: [
      "Schedule Q3 Executive Business Review",
      "Discuss DevOps Enterprise Tier Upsell",
      "Send case study on infrastructure cost savings"
    ],
    
    // Org Hierarchy (Simple representation)
    hierarchy: [
      { role: 'CEO', name: 'Sarah Chen' },
      { role: 'CTO', name: 'Marcus Johnson', parent: 'Sarah Chen' },
      { role: 'VP Engineering', name: 'David Kim', parent: 'Marcus Johnson' },
      { role: 'CFO', name: 'Elena Rodriguez', parent: 'Sarah Chen' }
    ],

    // Trend Data for Charts
    revenueTrend: [
      { month: 'Jan', revenue: 850 }, { month: 'Feb', revenue: 900 },
      { month: 'Mar', revenue: 950 }, { month: 'Apr', revenue: 1050 },
      { month: 'May', revenue: 1200 }, { month: 'Jun', revenue: 1250 }
    ],

    // Recent Timeline
    timeline: [
      { id: 1, type: 'Meeting', title: 'Q2 Strategy Review', date: '2026-06-12T14:00:00Z', user: 'Emily Rodriguez', details: 'Discussed expansion into EU market and increased compute limits.' },
      { id: 2, type: 'Email', title: 'Sent Proposal v2', date: '2026-06-10T09:30:00Z', user: 'Emily Rodriguez', details: 'Sent updated pricing for the enterprise tier.' },
      { id: 3, type: 'Note', title: 'Technical Discovery', date: '2026-06-05T16:15:00Z', user: 'Alex Systems Engineer', details: 'Client needs robust Kubernetes integration.' },
      { id: 4, type: 'Call', title: 'Initial Check-in', date: '2026-06-01T11:00:00Z', user: 'Emily Rodriguez', details: 'Routine check-in, client is happy with current performance.' }
    ]
  },
  {
    id: 'acc_2',
    name: 'Nexus Networks',
    logo: 'NN',
    industry: 'Telecommunications',
    website: 'www.nexus.net',
    phone: '+44 20 7123 4567',
    email: 'info@nexus.net',
    address: '1 Canada Square, London E14 5AB, UK',
    customerSince: '2025-08-22',
    foundedYear: 2010,
    taxId: 'GB-123456789',
    owner: 'Michael Chen',
    territory: 'EMEA',
    type: 'Prospect',
    segment: 'Enterprise',
    status: 'Needs Attention',
    healthScore: 65,
    revenue: 85000000,
    employeeCount: '5000+',
    openDealsCount: 1,
    closedDealsCount: 0,
    totalOpportunityValue: 1200000,
    activeContacts: 6,
    meetingsThisMonth: 1,
    lastActivity: '3 days ago',
    lastMeeting: '2026-05-28',
    renewalDate: null,
    ltv: 0,
    churnRisk: 40,
    upsellProbability: 20,
    renewalProbability: 0,
    description: 'Global telecommunications company exploring our network optimization suite.',
    
    aiSummary: "Nexus Networks is a high-value prospect with a $1.2M opportunity currently stuck in the Negotiation phase. Engagement has dropped recently (Health: 65). Key decision-maker David Smith has not responded to the last 2 emails.",
    aiRecommendations: [
      "Escalate to VP of Sales for executive outreach",
      "Offer technical proof-of-concept extension",
      "Invite to upcoming London CIO Dinner event"
    ],
    
    hierarchy: [
      { role: 'CIO', name: 'David Smith' },
      { role: 'Head of Infrastructure', name: 'James Wilson', parent: 'David Smith' }
    ],

    revenueTrend: [],

    timeline: [
      { id: 1, type: 'Email', title: 'Follow-up on POC', date: '2026-06-15T10:00:00Z', user: 'Michael Chen', details: 'No response yet.' },
      { id: 2, type: 'Meeting', title: 'POC Results Presentation', date: '2026-05-28T15:00:00Z', user: 'Michael Chen', details: 'Presented findings. They requested more time for internal review.' }
    ]
  },
  {
    id: 'acc_3',
    name: 'CloudSync Solutions',
    logo: 'CS',
    industry: 'SaaS',
    website: 'www.cloudsync.app',
    phone: '+1 (555) 987-6543',
    email: 'hello@cloudsync.app',
    address: 'Austin, TX 78701',
    customerSince: '2024-03-10',
    foundedYear: 2020,
    taxId: 'US-112233445',
    owner: 'Sarah Connor',
    territory: 'North America - South',
    type: 'Customer',
    segment: 'SMB',
    status: 'At Risk',
    healthScore: 42,
    revenue: 2500000,
    employeeCount: '50-200',
    openDealsCount: 0,
    closedDealsCount: 2,
    totalOpportunityValue: 0,
    activeContacts: 3,
    meetingsThisMonth: 0,
    lastActivity: '2 weeks ago',
    lastMeeting: '2026-04-10',
    renewalDate: '2026-09-10',
    ltv: 45000,
    churnRisk: 85,
    upsellProbability: 10,
    renewalProbability: 35,
    description: 'B2B file synchronization platform.',
    
    aiSummary: "CloudSync Solutions shows severe churn indicators (Risk: 85%). Product usage has dropped by 40% in the last month. Last meeting was over 2 months ago. Renewal is coming up in September.",
    aiRecommendations: [
      "Immediate Customer Success intervention required",
      "Review open support tickets immediately",
      "Offer courtesy account audit and training session"
    ],
    
    hierarchy: [
      { role: 'Founder & CEO', name: 'Mark Evans' },
      { role: 'Operations Manager', name: 'Lisa Ray', parent: 'Mark Evans' }
    ],

    revenueTrend: [
      { month: 'Jan', revenue: 45 }, { month: 'Feb', revenue: 45 },
      { month: 'Mar', revenue: 45 }, { month: 'Apr', revenue: 45 },
      { month: 'May', revenue: 45 }, { month: 'Jun', revenue: 45 }
    ],

    timeline: [
      { id: 1, type: 'Support Ticket', title: 'Integration Issue', date: '2026-06-01T08:00:00Z', user: 'System', details: 'Ticket #4421: Client reporting API timeouts. Escalated to Tier 2.' },
      { id: 2, type: 'Email', title: 'Q2 Check-in', date: '2026-05-15T10:00:00Z', user: 'Sarah Connor', details: 'Sent automated check-in email. No response.' }
    ]
  }
];

export const ACCOUNT_CONTACTS = [
  { id: 'c1', accountId: 'acc_1', name: 'Sarah Chen', title: 'CEO', email: 'schen@innovate.io', phone: '+1 555-0001', role: 'Decision Maker', avatar: 'https://i.pravatar.cc/150?u=c1' },
  { id: 'c2', accountId: 'acc_1', name: 'Marcus Johnson', title: 'CTO', email: 'mjohnson@innovate.io', phone: '+1 555-0002', role: 'Champion', avatar: 'https://i.pravatar.cc/150?u=c2' },
  { id: 'c3', accountId: 'acc_1', name: 'Elena Rodriguez', title: 'CFO', email: 'erodriguez@innovate.io', phone: '+1 555-0003', role: 'Finance Approver', avatar: 'https://i.pravatar.cc/150?u=c3' },
  { id: 'c4', accountId: 'acc_2', name: 'David Smith', title: 'CIO', email: 'dsmith@nexus.net', phone: '+44 20 1111 2222', role: 'Decision Maker', avatar: 'https://i.pravatar.cc/150?u=c4' },
];

export const ACCOUNT_DEALS = [
  { id: 'd1', accountId: 'acc_1', name: 'Enterprise Expansion - Q3', amount: 450000, stage: 'Negotiation', probability: 80, closeDate: '2026-08-15', owner: 'Emily Rodriguez' },
  { id: 'd2', accountId: 'acc_1', name: 'DevOps Training Package', amount: 50000, stage: 'Proposal', probability: 60, closeDate: '2026-07-30', owner: 'Emily Rodriguez' },
  { id: 'd3', accountId: 'acc_1', name: 'EU Infrastructure Setup', amount: 350000, stage: 'Discovery', probability: 30, closeDate: '2026-11-01', owner: 'Alex Systems' },
  { id: 'd4', accountId: 'acc_2', name: 'Global Network Optimizer POC', amount: 1200000, stage: 'Negotiation', probability: 50, closeDate: '2026-07-15', owner: 'Michael Chen' },
];
