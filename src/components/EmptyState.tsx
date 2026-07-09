import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    text: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
      <div className="flex flex-col items-center gap-1 text-center p-8">
        <div className="mb-4 text-muted-foreground">{icon}</div>
        <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        {action && (
          <Button className="mt-4" onClick={action.onClick}>{action.text}</Button>
        )}
      </div>
    </div>
  );
}
