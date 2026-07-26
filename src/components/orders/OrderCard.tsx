import { Card } from "@/components/ui/card";

interface OrderCardProps {
  children: React.ReactNode;
}

export default function OrderCard({
  children,
}: OrderCardProps) {
  return (
    <Card className="overflow-hidden border shadow-sm">
      {children}
    </Card>
  );
}
