import { useParams } from "react-router-dom";

export default function AdminOrderDetails() {
  const { orderId } = useParams();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold">
        Admin Order Details
      </h1>

      <p>Order ID: {orderId}</p>
    </div>
  );
}
