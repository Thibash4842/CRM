import PageHeader, { EmptyState } from '../components/ui/PageHeader';
import { StickyNote } from 'lucide-react';

export default function Notes() {
  return (
    <div>
      <PageHeader
        title="Notes"
        subtitle="Manage your linked notes"
      />

      <EmptyState
        icon={StickyNote}
        title="No notes yet"
        description="Create your first note to get started."
      />
    </div>
  );
}
