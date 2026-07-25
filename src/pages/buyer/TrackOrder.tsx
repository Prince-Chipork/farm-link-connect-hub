import { useParams } from "react-router-dom";

export default function TrackOrder() {
  const { orderId } = useParams();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">
        Track Order
      </h1>

      <p className="text-muted-foreground">
        Order ID: {orderId}
      </p>
    </div>
  );
}
