import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Select, Textarea, Input } from '../ui/Input';
import { CheckCircle, XCircle, Clock, Copy } from 'lucide-react';

const LOSS_REASONS = [
  'Budget Issue',
  'Not Interested',
  'Competitor Chosen',
  'No Response',
  'Invalid Contact',
  'Duplicate Lead',
  'Other',
];

export default function LeadConversionModal({ isOpen, onClose, lead, onConvert, onLost, onUpdateStatus, loading }) {
  const [outcome, setOutcome] = useState('');
  const [lossReason, setLossReason] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const finalNotes = notes ? (lead.notes ? `${lead.notes}\n\n${notes}` : notes) : lead.notes;
    
    if (outcome === 'WON') {
      onConvert(lead.id);
    } else if (outcome === 'LOST') {
      if (!lossReason) return alert('Loss reason is required');
      onLost(lead.id, { reason: lossReason, notes });
    } else if (outcome === 'FOLLOW_UP') {
      if (!followUpDate) return alert('Follow up date is required');
      onUpdateStatus(lead.id, { status: 'FOLLOW_UP', followUpDate, notes: finalNotes });
    } else if (outcome === 'DUPLICATE') {
      onUpdateStatus(lead.id, { status: 'DUPLICATE', notes: finalNotes });
    }
  };

  const OptionCard = ({ type, title, desc, icon: Icon, color, selected }) => (
    <div
      onClick={() => setOutcome(type)}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
        selected ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-900/20` : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/50 text-${color}-600 dark:text-${color}-400`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
        </div>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Convert Lead: ${lead?.fullName || lead?.firstName}`} size="lg">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">What would you like to do with this lead?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OptionCard
              type="WON"
              title="Won / Booked Lead"
              desc="Convert to an active client"
              icon={CheckCircle}
              color="emerald"
              selected={outcome === 'WON'}
            />
            <OptionCard
              type="LOST"
              title="Lost Lead"
              desc="Move to trash and log reason"
              icon={XCircle}
              color="red"
              selected={outcome === 'LOST'}
            />
            <OptionCard
              type="FOLLOW_UP"
              title="Follow Up Later"
              desc="Schedule a future follow up"
              icon={Clock}
              color="amber"
              selected={outcome === 'FOLLOW_UP'}
            />
            <OptionCard
              type="DUPLICATE"
              title="Duplicate Lead"
              desc="Mark as a duplicate entry"
              icon={Copy}
              color="slate"
              selected={outcome === 'DUPLICATE'}
            />
          </div>
        </div>

        {outcome === 'LOST' && (
          <div className="space-y-4 animate-fade-in">
            <Select
              label="Reason for Loss"
              value={lossReason}
              onChange={(e) => setLossReason(e.target.value)}
              options={LOSS_REASONS.map(r => ({ value: r, label: r }))}
              required
            />
            <Textarea
              label="Additional Notes (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why was this lead lost?"
            />
          </div>
        )}

        {outcome === 'FOLLOW_UP' && (
          <div className="space-y-4 animate-fade-in">
            <Input
              label="Follow-up Date"
              type="datetime-local"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              required
            />
            <Textarea
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        )}

        {outcome === 'DUPLICATE' && (
          <div className="space-y-4 animate-fade-in">
            <Textarea
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reference the original lead..."
            />
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleConfirm} loading={loading} disabled={!outcome}>Confirm Action</Button>
        </div>
      </div>
    </Modal>
  );
}
