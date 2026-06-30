// tagsService.js — localStorage-backed global tag library
// Tags are stored as: { id, label, color }
// Colors are Tailwind-compatible hex values

const TAG_STORAGE_KEY = 'scratchio_crm_tag_library';

export const TAG_COLOR_PALETTE = [
  { name: 'Indigo',   hex: '#6366f1', bg: 'bg-indigo-500',  text: 'text-indigo-600',  dark: 'dark:text-indigo-400',  ring: 'ring-indigo-500/30',  lightBg: 'bg-indigo-50 dark:bg-indigo-950/30',  border: 'border-indigo-200 dark:border-indigo-800/50' },
  { name: 'Violet',   hex: '#8b5cf6', bg: 'bg-violet-500',  text: 'text-violet-600',  dark: 'dark:text-violet-400',  ring: 'ring-violet-500/30',  lightBg: 'bg-violet-50 dark:bg-violet-950/30',  border: 'border-violet-200 dark:border-violet-800/50' },
  { name: 'Blue',     hex: '#3b82f6', bg: 'bg-blue-500',    text: 'text-blue-600',    dark: 'dark:text-blue-400',    ring: 'ring-blue-500/30',    lightBg: 'bg-blue-50 dark:bg-blue-950/30',      border: 'border-blue-200 dark:border-blue-800/50' },
  { name: 'Sky',      hex: '#0ea5e9', bg: 'bg-sky-500',     text: 'text-sky-600',     dark: 'dark:text-sky-400',     ring: 'ring-sky-500/30',     lightBg: 'bg-sky-50 dark:bg-sky-950/30',        border: 'border-sky-200 dark:border-sky-800/50' },
  { name: 'Cyan',     hex: '#06b6d4', bg: 'bg-cyan-500',    text: 'text-cyan-600',    dark: 'dark:text-cyan-400',    ring: 'ring-cyan-500/30',    lightBg: 'bg-cyan-50 dark:bg-cyan-950/30',      border: 'border-cyan-200 dark:border-cyan-800/50' },
  { name: 'Teal',     hex: '#14b8a6', bg: 'bg-teal-500',    text: 'text-teal-600',    dark: 'dark:text-teal-400',    ring: 'ring-teal-500/30',    lightBg: 'bg-teal-50 dark:bg-teal-950/30',      border: 'border-teal-200 dark:border-teal-800/50' },
  { name: 'Emerald',  hex: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-600', dark: 'dark:text-emerald-400', ring: 'ring-emerald-500/30', lightBg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800/50' },
  { name: 'Green',    hex: '#22c55e', bg: 'bg-green-500',   text: 'text-green-600',   dark: 'dark:text-green-400',   ring: 'ring-green-500/30',   lightBg: 'bg-green-50 dark:bg-green-950/30',    border: 'border-green-200 dark:border-green-800/50' },
  { name: 'Lime',     hex: '#84cc16', bg: 'bg-lime-500',    text: 'text-lime-700',    dark: 'dark:text-lime-400',    ring: 'ring-lime-500/30',    lightBg: 'bg-lime-50 dark:bg-lime-950/30',      border: 'border-lime-200 dark:border-lime-800/50' },
  { name: 'Yellow',   hex: '#eab308', bg: 'bg-yellow-500',  text: 'text-yellow-700',  dark: 'dark:text-yellow-400',  ring: 'ring-yellow-500/30',  lightBg: 'bg-yellow-50 dark:bg-yellow-950/30',  border: 'border-yellow-200 dark:border-yellow-800/50' },
  { name: 'Amber',    hex: '#f59e0b', bg: 'bg-amber-500',   text: 'text-amber-700',   dark: 'dark:text-amber-400',   ring: 'ring-amber-500/30',   lightBg: 'bg-amber-50 dark:bg-amber-950/30',    border: 'border-amber-200 dark:border-amber-800/50' },
  { name: 'Orange',   hex: '#f97316', bg: 'bg-orange-500',  text: 'text-orange-600',  dark: 'dark:text-orange-400',  ring: 'ring-orange-500/30',  lightBg: 'bg-orange-50 dark:bg-orange-950/30',  border: 'border-orange-200 dark:border-orange-800/50' },
  { name: 'Red',      hex: '#ef4444', bg: 'bg-red-500',     text: 'text-red-600',     dark: 'dark:text-red-400',     ring: 'ring-red-500/30',     lightBg: 'bg-red-50 dark:bg-red-950/30',        border: 'border-red-200 dark:border-red-800/50' },
  { name: 'Rose',     hex: '#f43f5e', bg: 'bg-rose-500',    text: 'text-rose-600',    dark: 'dark:text-rose-400',    ring: 'ring-rose-500/30',    lightBg: 'bg-rose-50 dark:bg-rose-950/30',      border: 'border-rose-200 dark:border-rose-800/50' },
  { name: 'Pink',     hex: '#ec4899', bg: 'bg-pink-500',    text: 'text-pink-600',    dark: 'dark:text-pink-400',    ring: 'ring-pink-500/30',    lightBg: 'bg-pink-50 dark:bg-pink-950/30',      border: 'border-pink-200 dark:border-pink-800/50' },
  { name: 'Fuchsia',  hex: '#d946ef', bg: 'bg-fuchsia-500', text: 'text-fuchsia-600', dark: 'dark:text-fuchsia-400', ring: 'ring-fuchsia-500/30', lightBg: 'bg-fuchsia-50 dark:bg-fuchsia-950/30', border: 'border-fuchsia-200 dark:border-fuchsia-800/50' },
  { name: 'Slate',    hex: '#64748b', bg: 'bg-slate-500',   text: 'text-slate-600',   dark: 'dark:text-slate-400',   ring: 'ring-slate-500/30',   lightBg: 'bg-slate-100 dark:bg-slate-800/40',   border: 'border-slate-200 dark:border-slate-700/50' },
];

// Pre-seeded example tag library
const DEFAULT_TAGS = [
  { id: 'tag-vip',      label: 'VIP',      colorHex: '#f43f5e' },
  { id: 'tag-meeting',  label: 'Meeting',  colorHex: '#f97316' },
  { id: 'tag-internal', label: 'Internal', colorHex: '#6366f1' },
  { id: 'tag-bug',      label: 'Bug',      colorHex: '#ef4444' },
  { id: 'tag-sales',    label: 'Sales',    colorHex: '#10b981' },
  { id: 'tag-support',  label: 'Support',  colorHex: '#0ea5e9' },
  { id: 'tag-priority', label: 'Priority', colorHex: '#eab308' },
  { id: 'tag-roadmap',  label: 'Roadmap',  colorHex: '#8b5cf6' },
  { id: 'tag-product',  label: 'Product',  colorHex: '#3b82f6' },
  { id: 'tag-engineering', label: 'Engineering', colorHex: '#14b8a6' },
  { id: 'tag-legal',    label: 'Legal',    colorHex: '#64748b' },
  { id: 'tag-finance',  label: 'Finance',  colorHex: '#f59e0b' },
  { id: 'tag-onboarding', label: 'Onboarding', colorHex: '#22c55e' },
  { id: 'tag-partner',  label: 'Partner',  colorHex: '#d946ef' },
  { id: 'tag-strategy', label: 'Strategy', colorHex: '#06b6d4' },
];

// Get the Tailwind style object for a given hex color
export function getTagStyle(colorHex) {
  const found = TAG_COLOR_PALETTE.find(c => c.hex === colorHex);
  return found || TAG_COLOR_PALETTE[0]; // default indigo
}

// Resolve a hex color to inline style (for non-Tailwind dynamic colors)
export function getTagInlineStyle(colorHex) {
  return {
    backgroundColor: colorHex + '18', // 10% alpha background
    color: colorHex,
    borderColor: colorHex + '55',     // 33% alpha border
  };
}

const getStoredTags = () => {
  const data = localStorage.getItem(TAG_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(TAG_STORAGE_KEY, JSON.stringify(DEFAULT_TAGS));
    return DEFAULT_TAGS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_TAGS;
  }
};

const setStoredTags = (tags) => {
  localStorage.setItem(TAG_STORAGE_KEY, JSON.stringify(tags));
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export const tagsService = {
  // Get all tags
  async getAll() {
    await sleep(50);
    return getStoredTags();
  },

  // Create a new tag
  async create({ label, colorHex }) {
    await sleep(80);
    if (!label?.trim()) throw new Error('Tag label is required');
    const tags = getStoredTags();
    if (tags.some(t => t.label.toLowerCase() === label.trim().toLowerCase())) {
      throw new Error(`Tag "${label}" already exists`);
    }
    const newTag = {
      id: `tag-${Date.now()}`,
      label: label.trim(),
      colorHex: colorHex || TAG_COLOR_PALETTE[0].hex,
    };
    const updated = [...tags, newTag];
    setStoredTags(updated);
    return newTag;
  },

  // Update an existing tag (label and/or color)
  async update(id, { label, colorHex }) {
    await sleep(80);
    const tags = getStoredTags();
    const idx = tags.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Tag not found');
    const updated = tags.map(t =>
      t.id === id ? { ...t, label: label?.trim() || t.label, colorHex: colorHex || t.colorHex } : t
    );
    setStoredTags(updated);
    return updated[idx];
  },

  // Delete a tag by id
  async delete(id) {
    await sleep(80);
    const tags = getStoredTags();
    const updated = tags.filter(t => t.id !== id);
    setStoredTags(updated);
    return true;
  },

  // Reset to defaults
  async resetAll() {
    await sleep(50);
    localStorage.removeItem(TAG_STORAGE_KEY);
    return getStoredTags();
  }
};
