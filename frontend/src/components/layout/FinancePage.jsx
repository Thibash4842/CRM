import PageHeader, { EmptyState } from '../ui/PageHeader';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function FinancePage({ title, subtitle, icon, buttonLabel }) {
  return (
    <div className="w-full">
      <PageHeader 
        title={title} 
        subtitle={subtitle} 
        onAdd={() => {}} 
        addLabel={buttonLabel} 
      />
      <Card className="min-h-[400px] flex items-center justify-center">
        <EmptyState 
          icon={icon} 
          title="No data available" 
          description={`There are currently no ${title.toLowerCase()} to display.`} 
          action={
            <Button onClick={() => {}}>
              {buttonLabel}
            </Button>
          }
        />
      </Card>
    </div>
  );
}
