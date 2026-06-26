import { useEffect, useState, useMemo } from 'react';
import { clientsApi } from '../services/api';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/PageHeader';

import ContactNavigator from '../components/contacts/ContactNavigator';
import ContactProfile from '../components/contacts/ContactProfile';
import ContactInsights from '../components/contacts/ContactInsights';

const emptyForm = {
  companyName: '', contactName: '', email: '', phone: '', website: '',
  industry: '', address: '', city: '', state: '', country: '', notes: '',
};

// Simulate enriched contact data
function enrichContact(c, index) {
  const scores = [92, 78, 85, 64, 88, 71, 95, 82, 56, 73];
  const titles = ['CEO', 'VP Sales', 'CTO', 'Director of Engineering', 'Marketing Manager', 'Head of Product', 'CFO', 'Account Executive'];
  const statuses = ['customer', 'prospect', 'vip', 'hot', 'inactive'];

  return {
    ...c,
    leadScore: c.leadScore || scores[index % scores.length],
    jobTitle: c.jobTitle || titles[index % titles.length],
    status: c.status || statuses[index % statuses.length],
    lastActivity: c.lastActivity || Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
    owner: c.owner || 'You',
  };
}

export default function Contacts() {
  const [allContacts, setAllContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchContacts = () => {
    setLoading(true);
    clientsApi.getAll(search)
      .then(data => {
        const enriched = data.map((c, i) => enrichContact(c, i));
        setAllContacts(enriched);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchContacts(); }, [search]);

  // ═══ WORKING FILTERS ═══
  const filteredContacts = useMemo(() => {
    let result = [...allContacts];

    switch (activeFilter) {
      case 'my':
        result = result.filter(c => c.owner === 'You');
        break;
      case 'customers':
        result = result.filter(c => c.status === 'customer');
        break;
      case 'vip':
        result = result.filter(c => c.status === 'vip' || c.leadScore >= 90);
        break;
      case 'hot':
        result = result.filter(c => c.status === 'hot' || c.leadScore >= 80);
        break;
      case 'recent':
        result = result.sort((a, b) => (b.lastActivity || 0) - (a.lastActivity || 0)).slice(0, 10);
        break;
      case 'inactive':
        result = result.filter(c => c.status === 'inactive' || c.leadScore < 60);
        break;
      default:
        break;
    }

    return result;
  }, [allContacts, activeFilter]);

  // Auto-select first contact when filter changes
  useEffect(() => {
    if (filteredContacts.length > 0) {
      const currentStillVisible = filteredContacts.find(c => c.id === selectedContact?.id);
      if (!currentStillVisible) {
        setSelectedContact(filteredContacts[0]);
      }
    } else {
      setSelectedContact(null);
    }
  }, [filteredContacts]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (contact) => {
    setEditing(contact);
    setForm({ ...contact });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) await clientsApi.update(editing.id, form);
      else await clientsApi.create(form);
      setModalOpen(false);
      fetchContacts();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden -m-6 bg-slate-50 dark:bg-slate-950">
      {loading ? (
        <div className="w-full flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Left Panel — Navigator */}
          <div className="w-72 xl:w-80 flex-shrink-0">
            <ContactNavigator
              contacts={filteredContacts}
              selectedContact={selectedContact}
              onSelectContact={setSelectedContact}
              search={search}
              onSearch={setSearch}
              onAddNew={openCreate}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>

          {/* Center Panel — 360° Profile */}
          <div className="flex-1 min-w-0 border-x border-slate-200/60 dark:border-slate-800/60">
            <ContactProfile
              contact={selectedContact}
              onEdit={openEdit}
            />
          </div>

          {/* Right Panel — Quick Insights */}
          <div className="w-72 xl:w-80 flex-shrink-0 hidden lg:block">
            <ContactInsights contact={selectedContact} />
          </div>
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Contact' : 'New Contact'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Company Name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
          <Input label="Contact Name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} required />
          <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <Input label="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        </div>
        <div className="mt-4">
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>{editing ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>
    </div>
  );
}
