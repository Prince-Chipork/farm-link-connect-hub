import { Card } from "@/components/ui/card";

interface OrderCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function OrderCard({
  children,
  className = "",
}: OrderCardProps) {
  return (
    <Card
      className={`overflow-hidden border shadow-sm ${className}`}
    >
      {children}
    </Card>
  );
}
