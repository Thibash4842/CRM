import React, { useEffect, useState, useMemo } from 'react';
import {
  DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { dealsApi } from '../services/api';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { DEAL_STAGES } from '../utils/constants';
import PipelineHeader from '../components/deals/PipelineHeader';
import PipelineSummary from '../components/deals/PipelineSummary';
import KanbanColumn from '../components/deals/KanbanColumn';
import DealCard from '../components/deals/DealCard';

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDeal, setActiveDeal] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', value: '', expectedCloseDate: '' });
  const [saving, setSaving] = useState(false);
  
  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const fetchDeals = () => {
    setLoading(true);
    dealsApi.getAll().then(setDeals).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchDeals(); }, []);

  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      // Search
      if (searchTerm && !deal.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !(deal.clientName && deal.clientName.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }
      
      // Quick Filters
      if (activeFilter === 'Won' && deal.stage !== 'WON') return false;
      if (activeFilter === 'Lost' && deal.stage !== 'LOST') return false;
      if (activeFilter === 'High Value' && Number(deal.value) < 10000) return false;
      // Mock "Closing Soon" and "My Deals" logic
      if (activeFilter === 'Closing Soon' && (!deal.expectedCloseDate || new Date(deal.expectedCloseDate) > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))) return false;
      
      return true;
    });
  }, [deals, searchTerm, activeFilter]);

  const dealsByStage = DEAL_STAGES.reduce((acc, stage) => {
    acc[stage.value] = filteredDeals.filter((d) => d.stage === stage.value);
    return acc;
  }, {});

  const handleDragStart = (event) => {
    const deal = deals.find((d) => d.id === event.active.id);
    setActiveDeal(deal);
  };

  const handleDragEnd = async (event) => {
    setActiveDeal(null);
    const { active, over } = event;
    if (!over) return;

    const dealId = active.id;
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return;

    let newStage = deal.stage;
    if (DEAL_STAGES.some((s) => s.value === over.id)) {
      newStage = over.id;
    } else {
      const overDeal = deals.find((d) => d.id === over.id);
      if (overDeal) newStage = overDeal.stage;
    }

    if (newStage !== deal.stage) {
      setDeals((prev) => prev.map((d) => d.id === dealId ? { ...d, stage: newStage } : d));
      try {
        await dealsApi.updateStage(dealId, newStage);
      } catch {
        fetchDeals(); // revert on failure
      }
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      await dealsApi.create(form);
      setModalOpen(false);
      setForm({ title: '', description: '', value: '', expectedCloseDate: '' });
      fetchDeals();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <PipelineHeader 
        onNewDeal={() => setModalOpen(true)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />
      
      <PipelineSummary deals={filteredDeals} />

      <div className="flex-1 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto overflow-y-hidden h-full pb-4">
            {DEAL_STAGES.map((stage) => (
              <div key={stage.value} id={stage.value} data-stage={stage.value}>
                <KanbanColumn stage={stage} deals={dealsByStage[stage.value] || []} />
              </div>
            ))}
          </div>
          <DragOverlay>
            {activeDeal ? <DealCard deal={activeDeal} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Deal">
        <div className="space-y-4">
          <Input label="Deal Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="Value ($)" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
          <Input label="Expected Close Date" type="date" value={form.expectedCloseDate} onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} loading={saving}>Create Deal</Button>
        </div>
      </Modal>
    </div>
  );
}
