import { api } from './api';

const API_URL = '/notes';

export const MOCK_USERS = [
  { id: 'u1', name: 'Sarah Jenkins', initials: 'SJ', color: 'bg-emerald-500' },
  { id: 'u2', name: 'Michael Chen', initials: 'MC', color: 'bg-blue-500' },
  { id: 'u3', name: 'Aisha Patel', initials: 'AP', color: 'bg-purple-500' },
  { id: 'u4', name: 'John Doe', initials: 'JD', color: 'bg-indigo-600' }
];

export const ACTIVE_USER = MOCK_USERS[3];

export const notesService = {
  async getAll() {
    return api.get(API_URL);
  },

  async getById(id) {
    return api.get(`${API_URL}/${id}`);
  },

  async create(note) {
    return api.post(API_URL, note);
  },

  async update(id, updatedFields) {
    return api.put(`${API_URL}/${id}`, updatedFields);
  },

  async delete(id) {
    await api.delete(`${API_URL}/${id}`);
    return true;
  },

  async togglePin(id) {
    const note = await this.getById(id);
    return this.update(id, { pinned: !note.pinned });
  },

  async toggleFavorite(id) {
    const note = await this.getById(id);
    return this.update(id, { favorite: !note.favorite });
  },

  async toggleArchive(id) {
    const note = await this.getById(id);
    return this.update(id, { archived: !note.archived });
  },

  async toggleShare(id) {
    const note = await this.getById(id);
    return this.update(id, { shared: !note.shared });
  },

  async duplicate(id) {
    const existing = await this.getById(id);
    const { id: _, createdAt, updatedAt, ...copyData } = existing;
    const newNote = {
      ...copyData,
      title: `${existing.title} (Copy)`,
      pinned: false,
      favorite: false,
      shared: false,
      versions: [],
      comments: [],
      activity: []
    };
    return this.create(newNote);
  },

  async resetAll() {
    // Just fetch notes for now, resetAll doesn't apply to a real DB unless we delete all
    return this.getAll();
  },

  async markAsRead(noteId) {
    return this.update(noteId, { lastReadAt: new Date().toISOString() });
  }
};
