import {
  Clock,
  Package,
  Truck,
  CheckCircle2,
} from "lucide-react";

const ORDER_STEPS = [
  "pending",
  "accepted",
  "processing",
  "packed",
  "shipped",
  "delivered",
];

type Props = {
  status: string;
};

export default function OrderTimeline({
  status,
}: Props) {
  const stepReached = (target: string) =>
    ORDER_STEPS.indexOf((status || "").toLowerCase()) >=
    ORDER_STEPS.indexOf(target);

  return (
    <div className="mt-4">
      <div className="overflow-x-auto">
        <div className="flex min-w-[700px] items-center justify-between gap-2 text-[11px] font-medium">

          <div className={`flex flex-col items-center ${
            stepReached("pending")
              ? "text-primary"
              : "text-muted-foreground"
          }`}>
            <Clock className="h-4 w-4 mb-1" />
            <span>Pending</span>
          </div>

          <div className="flex-1 h-[2px] bg-border" />

          <div className={`flex flex-col items-center ${
            stepReached("accepted")
              ? "text-primary"
              : "text-muted-foreground"
          }`}>
            <Package className="h-4 w-4 mb-1" />
            <span>Accepted</span>
          </div>

          <div className="flex-1 h-[2px] bg-border" />

          <div className={`flex flex-col items-center ${
            stepReached("processing")
              ? "text-primary"
              : "text-muted-foreground"
          }`}>
            <Package className="h-4 w-4 mb-1" />
            <span>Processing</span>
          </div>

          <div className="flex-1 h-[2px] bg-border" />

          <div className={`flex flex-col items-center ${
            stepReached("packed")
              ? "text-primary"
              : "text-muted-foreground"
          }`}>
            <Package className="h-4 w-4 mb-1" />
            <span>Packed</span>
          </div>

          <div className="flex-1 h-[2px] bg-border" />

          <div className={`flex flex-col items-center ${
            stepReached("shipped")
              ? "text-primary"
              : "text-muted-foreground"
          }`}>
            <Truck className="h-4 w-4 mb-1" />
            <span>Shipped</span>
          </div>

          <div className="flex-1 h-[2px] bg-border" />

          <div className={`flex flex-col items-center ${
            stepReached("delivered")
              ? "text-green-600"
              : "text-muted-foreground"
          }`}>
            <CheckCircle2 className="h-4 w-4 mb-1" />
            <span>Delivered</span>
          </div>

        </div>
      </div>
    </div>
  );
}
