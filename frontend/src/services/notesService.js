const LOCAL_STORAGE_KEY = 'scratchio_crm_notes';

export const MOCK_USERS = [
  { id: 'u1', name: 'Sarah Jenkins', initials: 'SJ', color: 'bg-emerald-500' },
  { id: 'u2', name: 'Michael Chen', initials: 'MC', color: 'bg-blue-500' },
  { id: 'u3', name: 'Aisha Patel', initials: 'AP', color: 'bg-purple-500' },
  { id: 'u4', name: 'John Doe', initials: 'JD', color: 'bg-indigo-600' }
];

export const ACTIVE_USER = MOCK_USERS[3]; // John Doe

const initialNotes = [
  {
    id: 1,
    title: 'Sales Pitch Feedback: Acme Corp',
    content: 'Met with Sarah and team from Acme Corp. They loved the CRM demo, especially the dashboard layout and notification bells. Asked for pricing details on 50 seats. Action items: Follow up with custom proposal by Thursday, confirm SSO capability.',
    tags: ['Sales', 'Acme', 'Pitch'],
    linkedRecords: [
      { id: 'deal-1', type: 'Deal', name: 'Acme CRM Software' },
      { id: 'account-1', type: 'Account', name: 'Acme Corp' }
    ],
    owner: { name: 'Sarah Jenkins', initials: 'SJ', color: 'bg-emerald-500' },
    pinned: true,
    favorite: true,
    shared: true,
    sharedWith: [],
    archived: false,
    attachmentsCount: 2,
    createdAt: '2026-06-25T14:30:00.000Z',
    updatedAt: '2026-06-26T09:15:00.000Z',
    lastReadAt: '2026-06-26T09:00:00.000Z',
    activity: [
      // ... existing activities ...
    ],
    comments: [
      // ... existing comments ...
    ],
    versions: [
      // ... existing versions ...
    ]
  },
  {
    id: 1,
    title: 'Sales Pitch Feedback: Acme Corp',
    content: 'Met with Sarah and team from Acme Corp. They loved the CRM demo, especially the dashboard layout and notification bells. Asked for pricing details on 50 seats. Action items: Follow up with custom proposal by Thursday, confirm SSO capability.',
    tags: ['Sales', 'Acme', 'Pitch'],
    linkedRecords: [
      { id: 'deal-1', type: 'Deal', name: 'Acme CRM Software' },
      { id: 'account-1', type: 'Account', name: 'Acme Corp' }
    ],
    owner: { name: 'Sarah Jenkins', initials: 'SJ', color: 'bg-emerald-500' },
    pinned: true,
    favorite: true,
    shared: true,
    archived: false,
    attachmentsCount: 2,
    createdAt: '2026-06-25T14:30:00.000Z',
    updatedAt: '2026-06-26T09:15:00.000Z',
    lastReadAt: '2026-06-26T09:00:00.000Z',
    activity: [
      {
        id: 'act-1-1',
        type: 'created',
        actor: MOCK_USERS[0],
        timestamp: '2026-06-25T14:30:00.000Z',
        meta: {}
      },
      {
        id: 'act-1-2',
        type: 'attachment_added',
        actor: MOCK_USERS[0],
        timestamp: '2026-06-25T14:35:00.000Z',
        meta: { filename: 'contract_draft.pdf' }
      },
      {
        id: 'act-1-3',
        type: 'shared',
        actor: MOCK_USERS[0],
        timestamp: '2026-06-25T15:00:00.000Z',
        meta: {}
      },
      {
        id: 'act-1-4',
        type: 'comment_added',
        actor: MOCK_USERS[1],
        timestamp: '2026-06-25T15:05:00.000Z',
        meta: { preview: 'Did they mention a specific budget...' }
      },
      {
        id: 'act-1-5',
        type: 'mention',
        actor: MOCK_USERS[2],
        timestamp: '2026-06-26T09:20:00.000Z',
        meta: { mentioned: MOCK_USERS[0].name }
      },
      {
        id: 'act-1-6',
        type: 'edited',
        actor: MOCK_USERS[0],
        timestamp: '2026-06-26T09:15:00.000Z',
        meta: { field: 'content' }
      }
    ],
    comments: [
      {
        id: 'c1',
        text: 'Did they mention a specific budget for the 50 seats?',
        author: MOCK_USERS[1],
        createdAt: '2026-06-25T15:00:00.000Z',
        updatedAt: '2026-06-25T15:00:00.000Z',
        reactions: { '👍': [MOCK_USERS[1].name] },
        replies: [
          {
            id: 'c1-r1',
            text: 'Yes, around $20k ARR. I will include it in the proposal.',
            author: MOCK_USERS[0],
            createdAt: '2026-06-25T15:15:00.000Z',
            updatedAt: '2026-06-25T15:15:00.000Z'
          }
        ]
      },
      {
        id: 'c2',
        text: 'Great job @Sarah Jenkins! Let me know if you need help with the proposal.',
        author: MOCK_USERS[2],
        createdAt: '2026-06-26T09:20:00.000Z',
        updatedAt: '2026-06-26T09:20:00.000Z',
        reactions: { '❤️': [MOCK_USERS[0].name, MOCK_USERS[1].name] },
        replies: []
      }
    ],
    versions: [
      {
        id: 'v-1-1',
        versionNumber: 1,
        title: 'Sales Pitch Feedback: Acme Corp',
        content: 'Met with Sarah and team from Acme Corp. They were interested in the CRM demo. Asked for pricing details.',
        tags: ['Sales', 'Acme'],
        linkedRecords: [{ id: 'deal-1', type: 'Deal', name: 'Acme CRM Software' }],
        author: MOCK_USERS[0],
        savedAt: '2026-06-25T14:30:00.000Z',
        label: 'Initial draft'
      },
      {
        id: 'v-1-2',
        versionNumber: 2,
        title: 'Sales Pitch Feedback: Acme Corp',
        content: 'Met with Sarah and team from Acme Corp. They loved the CRM demo, especially the dashboard layout. Asked for pricing details on 50 seats. Action items: Follow up with custom proposal by Thursday.',
        tags: ['Sales', 'Acme', 'Pitch'],
        linkedRecords: [
          { id: 'deal-1', type: 'Deal', name: 'Acme CRM Software' },
          { id: 'account-1', type: 'Account', name: 'Acme Corp' }
        ],
        author: MOCK_USERS[0],
        savedAt: '2026-06-25T16:00:00.000Z',
        label: 'Added meeting details'
      },
      {
        id: 'v-1-3',
        versionNumber: 3,
        title: 'Sales Pitch Feedback: Acme Corp',
        content: 'Met with Sarah and team from Acme Corp. They loved the CRM demo, especially the dashboard layout and notification bells. Asked for pricing details on 50 seats. Action items: Follow up with custom proposal by Thursday, confirm SSO capability.',
        tags: ['Sales', 'Acme', 'Pitch'],
        linkedRecords: [
          { id: 'deal-1', type: 'Deal', name: 'Acme CRM Software' },
          { id: 'account-1', type: 'Account', name: 'Acme Corp' }
        ],
        author: MOCK_USERS[1],
        savedAt: '2026-06-26T09:15:00.000Z',
        label: 'Final version (current)'
      }
    ]
  },
  {
    id: 2,
    title: 'Q3 Product Roadmap Review',
    content: 'Internal sync with engineering team. We reviewed timeline for notification settings customization and command palette integrations. Determined that JWT filters should be completed before auth page redesign. Next sprint focus will be UI polish.',
    tags: ['Roadmap', 'Product', 'Engineering'],
    linkedRecords: [
      { id: 'project-1', type: 'Project', name: 'Roadmap Refinement' }
    ],
    owner: { name: 'Michael Chen', initials: 'MC', color: 'bg-blue-500' },
    pinned: true,
    favorite: false,
    shared: false,
    archived: false,
    attachmentsCount: 1,
    createdAt: '2026-06-28T10:00:00.000Z',
    updatedAt: '2026-06-28T11:45:00.000Z',
    activity: [
      {
        id: 'act-2-1',
        type: 'created',
        actor: MOCK_USERS[1],
        timestamp: '2026-06-28T10:00:00.000Z',
        meta: {}
      },
      {
        id: 'act-2-2',
        type: 'attachment_added',
        actor: MOCK_USERS[1],
        timestamp: '2026-06-28T10:10:00.000Z',
        meta: { filename: 'roadmap_v3.pdf' }
      },
      {
        id: 'act-2-3',
        type: 'edited',
        actor: MOCK_USERS[1],
        timestamp: '2026-06-28T11:45:00.000Z',
        meta: { field: 'title' }
      }
    ]
  },
  {
    id: 3,
    title: 'Client Onboarding Check-in: Nike Retail',
    content: 'Nike stakeholders are ready to start onboarding. We need to upload client contacts, migrate their historical leads from CSV files, and train their administrators. Schedule kick-off call for next Tuesday.',
    tags: ['Onboarding', 'Nike', 'Support'],
    linkedRecords: [
      { id: 'client-1', type: 'Client', name: 'Nike Retail Group' },
      { id: 'project-2', type: 'Project', name: 'Nike Portal Development' }
    ],
    owner: { name: 'Aisha Patel', initials: 'AP', color: 'bg-purple-500' },
    pinned: false,
    favorite: true,
    shared: true,
    archived: false,
    attachmentsCount: 4,
    createdAt: '2026-06-27T08:30:00.000Z',
    updatedAt: '2026-06-29T16:20:00.000Z'
  },
  {
    id: 4,
    title: 'Budget Forecast Adjustment Notes',
    content: 'Finance requested adjustments to deal commissions. The reports dashboard must reflect payment summary updates. Added details to deal calculations in spreadsheets.',
    tags: ['Finance', 'Budget'],
    linkedRecords: [
      { id: 'account-2', type: 'Account', name: 'Nike Operations' }
    ],
    owner: { name: 'Sarah Jenkins', initials: 'SJ', color: 'bg-emerald-500' },
    pinned: false,
    favorite: false,
    shared: false,
    archived: false,
    attachmentsCount: 0,
    createdAt: '2026-06-29T09:00:00.000Z',
    updatedAt: '2026-06-29T10:30:00.000Z'
  },
  {
    id: 5,
    title: 'Lead Nurturing Campaign Strategy',
    content: 'Reviewed marketing campaign metrics. Cold leads converting at 2.4%, won leads account for 45% of conversions. We should optimize follow-up templates inside lead details panels.',
    tags: ['Marketing', 'Leads', 'Strategy'],
    linkedRecords: [
      { id: 'lead-1', type: 'Lead', name: 'John Miller' }
    ],
    owner: { name: 'Michael Chen', initials: 'MC', color: 'bg-blue-500' },
    pinned: false,
    favorite: false,
    shared: false,
    archived: true,
    attachmentsCount: 1,
    createdAt: '2026-06-24T11:20:00.000Z',
    updatedAt: '2026-06-24T15:10:00.000Z'
  },
  {
    id: 6,
    title: 'Partner Program Agreement Terms',
    content: 'Reviewed updated SLA agreement for distribution partners. Discussed with legal representative and signed contract. Will store documents under local directory.',
    tags: ['Legal', 'Agreement', 'Partner'],
    linkedRecords: [
      { id: 'account-3', type: 'Account', name: 'General Distributors' }
    ],
    owner: { name: 'Sarah Jenkins', initials: 'SJ', color: 'bg-emerald-500' },
    pinned: false,
    favorite: false,
    shared: true,
    archived: false,
    attachmentsCount: 0,
    createdAt: '2026-06-30T05:00:00.000Z',
    updatedAt: '2026-06-30T09:30:00.000Z'
  }
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const makeActivity = (type, meta = {}) => ({
  id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type,
  actor: ACTIVE_USER,
  timestamp: new Date().toISOString(),
  meta
});

const makeVersion = (note, versionNumber) => ({
  id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  versionNumber,
  title: note.title,
  content: note.content,
  tags: note.tags || [],
  linkedRecords: note.linkedRecords || [],
  author: ACTIVE_USER,
  savedAt: new Date().toISOString()
});

const getStoredNotes = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialNotes));
    return initialNotes;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialNotes;
  }
};

const setStoredNotes = (notes) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
};

export const notesService = {
  async getAll() {
    await sleep(600);
    return getStoredNotes();
  },

  async create(note) {
    await sleep(600);
    if (note.title.toLowerCase().includes('error')) {
      throw new Error('Simulated network error: Database failed to insert record.');
    }
    
    const notes = getStoredNotes();
    const baseNote = {
      ...note,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activity: [ makeActivity('created') ],
      versions: []
    };
    // Push v1 snapshot
    baseNote.versions.push({
      id: `v-${baseNote.id}-1`,
      versionNumber: 1,
      title: baseNote.title,
      content: baseNote.content,
      tags: baseNote.tags || [],
      linkedRecords: baseNote.linkedRecords || [],
      author: ACTIVE_USER,
      savedAt: baseNote.createdAt,
      label: 'Initial version'
    });
    notes.unshift(baseNote);
    setStoredNotes(notes);
    return baseNote;
  },

  async update(id, updatedFields) {
    await sleep(600);
    // Error test hook
    if (updatedFields.title && updatedFields.title.toLowerCase().includes('error')) {
      throw new Error('Simulated network error: Database lock encountered.');
    }

    const notes = getStoredNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) throw new Error('Note not found.');

    const existing = notes[index];
    const existingVersions = existing.versions || [];
    const nextVersionNum = existingVersions.length + 1;

    // Capture the CURRENT state as the new version (before applying changes)
    const newVersion = {
      id: `v-${id}-${nextVersionNum}-${Date.now()}`,
      versionNumber: nextVersionNum,
      title: updatedFields.title ?? existing.title,
      content: updatedFields.content ?? existing.content,
      tags: updatedFields.tags ?? existing.tags ?? [],
      linkedRecords: updatedFields.linkedRecords ?? existing.linkedRecords ?? [],
      author: ACTIVE_USER,
      savedAt: new Date().toISOString()
    };

    const updatedNote = {
      ...existing,
      ...updatedFields,
      updatedAt: new Date().toISOString(),
      versions: [...existingVersions, newVersion],
      activity: [
        ...(existing.activity || []),
        makeActivity('edited', { field: 'content', version: nextVersionNum })
      ]
    };
    notes[index] = updatedNote;
    setStoredNotes(notes);
    return updatedNote;
  },

  async delete(id) {
    await sleep(600);
    const notes = getStoredNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) throw new Error('Note not found.');
    
    const filtered = notes.filter(n => n.id !== id);
    setStoredNotes(filtered);
    return true;
  },

  async togglePin(id) {
    await sleep(400); // Shorter sleep for inline quick actions
    const notes = getStoredNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) throw new Error('Note not found.');

    // Simulated quick failure hook for rollbacks (e.g. if title is 'Budget Forecast Adjustment Notes', throw error)
    if (notes[index].title.toLowerCase().includes('budget')) {
      throw new Error('Simulated network failure: Could not pin locked forecast data.');
    }

    const updated = {
      ...notes[index],
      pinned: !notes[index].pinned,
      updatedAt: new Date().toISOString()
    };
    notes[index] = updated;
    setStoredNotes(notes);
    return updated;
  },

  async toggleFavorite(id) {
    await sleep(400);
    const notes = getStoredNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) throw new Error('Note not found.');

    // Sim failure check
    if (notes[index].title.toLowerCase().includes('budget')) {
      throw new Error('Simulated network failure: Could not favorite locked forecast data.');
    }

    const updated = {
      ...notes[index],
      favorite: !notes[index].favorite,
      updatedAt: new Date().toISOString()
    };
    notes[index] = updated;
    setStoredNotes(notes);
    return updated;
  },

  async toggleArchive(id) {
    await sleep(600);
    const notes = getStoredNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) throw new Error('Note not found.');

    const willArchive = !notes[index].archived;
    const updated = {
      ...notes[index],
      archived: willArchive,
      pinned: willArchive ? false : notes[index].pinned,
      updatedAt: new Date().toISOString(),
      activity: [
        ...(notes[index].activity || []),
        makeActivity(willArchive ? 'archived' : 'restored')
      ]
    };
    notes[index] = updated;
    setStoredNotes(notes);
    return updated;
  },

  async toggleShare(id) {
    await sleep(600);
    const notes = getStoredNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) throw new Error('Note not found.');

    const willShare = !notes[index].shared;
    const updated = {
      ...notes[index],
      shared: willShare,
      updatedAt: new Date().toISOString(),
      activity: [
        ...(notes[index].activity || []),
        makeActivity(willShare ? 'shared' : 'unshared')
      ]
    };
    notes[index] = updated;
    setStoredNotes(notes);
    return updated;
  },

  async shareNote(id, target) {
    await sleep(600);
    const notes = getStoredNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) throw new Error('Note not found.');
    const updated = {
      ...notes[index],
      shared: true,
      sharedWith: [...(notes[index].sharedWith || []), target],
      updatedAt: new Date().toISOString(),
      activity: [
        ...(notes[index].activity || []),
        makeActivity('shared', { target })
      ]
    };
    notes[index] = updated;
    setStoredNotes(notes);
    return updated;
  },

  async getVersions(id) {
    await sleep(300);
    const notes = getStoredNotes();
    const note = notes.find(n => n.id === id);
    if (!note) throw new Error('Note not found.');
    return note.versions || [];
  },

  async restoreVersion(noteId, versionId) {
    await sleep(600);
    const notes = getStoredNotes();
    const index = notes.findIndex(n => n.id === noteId);
    if (index === -1) throw new Error('Note not found.');
    const note = notes[index];
    const version = (note.versions || []).find(v => v.id === versionId);
    if (!version) throw new Error('Version not found.');
    // Capture current state as a new version before overwriting
    const currentVersion = {
      id: `v-${noteId}-${(note.versions?.length || 0) + 1}-${Date.now()}`,
      versionNumber: (note.versions?.length || 0) + 1,
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      linkedRecords: note.linkedRecords || [],
      author: ACTIVE_USER,
      savedAt: new Date().toISOString(),
      label: 'Auto snapshot before restore'
    };
    const newVersions = [...(note.versions || []), currentVersion];
    // Apply selected version data
    const restored = {
      ...note,
      title: version.title,
      content: version.content,
      tags: version.tags,
      linkedRecords: version.linkedRecords,
      updatedAt: new Date().toISOString(),
      versions: newVersions,
      activity: [
        ...(note.activity || []),
        makeActivity('restored_version', { fromVersion: version.versionNumber })
      ]
    };
    notes[index] = restored;
    setStoredNotes(notes);
    return restored;
  },

  // Reset to original data
  async resetAll() {
    await sleep(500);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialNotes));
    return initialNotes;
  },

  // --- Collaboration (Comments) Methods ---

  async markAsRead(noteId) {
    const notes = getStoredNotes();
    const index = notes.findIndex(n => n.id === noteId);
    if (index === -1) return null;

    const updated = {
      ...notes[index],
      lastReadAt: new Date().toISOString()
    };
    notes[index] = updated;
    setStoredNotes(notes);
    return updated;
  },

  async addComment(noteId, text, parentId = null) {
    await sleep(300);
    const notes = getStoredNotes();
    const index = notes.findIndex(n => n.id === noteId);
    if (index === -1) throw new Error('Note not found.');

    const newComment = {
      id: `comment-${Date.now()}`,
      text,
      author: ACTIVE_USER,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reactions: {},
      replies: []
    };

    const note = { ...notes[index] };
    note.comments = note.comments || [];
    note.activity = note.activity || [];

    if (parentId) {
      const parent = note.comments.find(c => c.id === parentId);
      if (!parent) throw new Error('Parent comment not found.');
      parent.replies = parent.replies || [];
      parent.replies.push(newComment);
      note.activity.push(makeActivity('comment_added', { preview: text.slice(0, 60) }));
    } else {
      note.comments.push(newComment);
      // Check for mentions in text
      const mentionMatches = text.match(/@([\w]+ [\w]+|[\w]+)/g) || [];
      note.activity.push(makeActivity('comment_added', { preview: text.slice(0, 60) }));
      mentionMatches.forEach(mention => {
        note.activity.push(makeActivity('mention', { mentioned: mention.slice(1) }));
      });
    }

    notes[index] = note;
    setStoredNotes(notes);
    return note;
  },

  async updateComment(noteId, commentId, text, parentId = null) {
    await sleep(300);
    const notes = getStoredNotes();
    const index = notes.findIndex(n => n.id === noteId);
    if (index === -1) throw new Error('Note not found.');

    const note = { ...notes[index] };
    
    if (parentId) {
      const parent = note.comments.find(c => c.id === parentId);
      if (!parent) throw new Error('Parent not found.');
      const reply = parent.replies.find(r => r.id === commentId);
      if (reply) {
        reply.text = text;
        reply.updatedAt = new Date().toISOString();
      }
    } else {
      const comment = note.comments.find(c => c.id === commentId);
      if (comment) {
        comment.text = text;
        comment.updatedAt = new Date().toISOString();
      }
    }

    notes[index] = note;
    setStoredNotes(notes);
    return note;
  },

  async deleteComment(noteId, commentId, parentId = null) {
    await sleep(300);
    const notes = getStoredNotes();
    const index = notes.findIndex(n => n.id === noteId);
    if (index === -1) throw new Error('Note not found.');

    const note = { ...notes[index] };
    
    if (parentId) {
      const parent = note.comments.find(c => c.id === parentId);
      if (parent) {
        parent.replies = parent.replies.filter(r => r.id !== commentId);
      }
    } else {
      note.comments = note.comments.filter(c => c.id !== commentId);
    }

    notes[index] = note;
    setStoredNotes(notes);
    return note;
  },

  async addReaction(noteId, commentId, emoji, parentId = null) {
    const notes = getStoredNotes();
    const index = notes.findIndex(n => n.id === noteId);
    if (index === -1) throw new Error('Note not found.');

    const note = { ...notes[index] };
    let target = null;

    if (parentId) {
      const parent = note.comments.find(c => c.id === parentId);
      if (parent) target = parent.replies.find(r => r.id === commentId);
    } else {
      target = note.comments.find(c => c.id === commentId);
    }

    if (target) {
      target.reactions = target.reactions || {};
      const users = target.reactions[emoji] || [];
      if (users.includes(ACTIVE_USER.name)) {
        target.reactions[emoji] = users.filter(u => u !== ACTIVE_USER.name);
      } else {
        target.reactions[emoji] = [...users, ACTIVE_USER.name];
      }
      if (target.reactions[emoji].length === 0) {
        delete target.reactions[emoji];
      }
    }

    notes[index] = note;
    setStoredNotes(notes);
    return note;
  },
  // Reminder management
  async addReminder(noteId, reminder) {
    await sleep(300);
    const notes = getStoredNotes();
    const note = notes.find(n => n.id === noteId);
    if (!note) throw new Error('Note not found.');
    const newReminder = {
      id: `r-${noteId}-${Date.now()}`,
      title: reminder.title || 'Reminder',
      time: reminder.time,
      repeat: reminder.repeat || null,
      type: reminder.type || ['inApp'],
      createdAt: new Date().toISOString()
    };
    note.reminders = note.reminders || [];
    note.reminders.push(newReminder);
    setStoredNotes(notes);
    return newReminder;
  },

  async getReminders(noteId) {
    await sleep(200);
    const notes = getStoredNotes();
    const note = notes.find(n => n.id === noteId);
    return (note && note.reminders) || [];
  },

  async deleteReminder(noteId, reminderId) {
    await sleep(200);
    const notes = getStoredNotes();
    const note = notes.find(n => n.id === noteId);
    if (!note) throw new Error('Note not found.');
    note.reminders = (note.reminders || []).filter(r => r.id !== reminderId);
    setStoredNotes(notes);
    return true;
  },

  async getAllUpcomingReminders() {
    await sleep(200);
    const now = new Date().toISOString();
    const notes = getStoredNotes();
    const all = [];
    notes.forEach(n => {
      (n.reminders || []).forEach(r => {
        if (r.time >= now) all.push({ ...r, noteId: n.id });
      });
    });
    return all;
  },

  async recordFiredReminder(reminder) {
    await sleep(200);
    const notes = getStoredNotes();
    const note = notes.find(n => n.id === reminder.noteId);
    if (note) {
      note.reminderHistory = note.reminderHistory || [];
      note.reminderHistory.push({ ...reminder, firedAt: new Date().toISOString() });
      // Remove one‑time reminder
      if (!reminder.repeat) {
        note.reminders = (note.reminders || []).filter(r => r.id !== reminder.id);
      }
    }
    setStoredNotes(notes);
    return true;
  },

  async getReminderHistory(noteId) {
    await sleep(200);
    const notes = getStoredNotes();
    const note = notes.find(n => n.id === noteId);
    return (note && note.reminderHistory) || [];
  },

  // End of reminder management
};
