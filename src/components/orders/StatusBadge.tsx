import { Badge } from "@/components/ui/badge";

type Props = {
  status?: string | null;
};

export default function StatusBadge({ status }: Props) {
  switch ((status || "").toLowerCase()) {
    case "pending":
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
          Pending
        </Badge>
      );

    case "accepted":
      return (
        <Badge className="bg-cyan-600 hover:bg-cyan-700 text-white">
          Accepted
        </Badge>
      );

    case "processing":
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
          Processing
        </Badge>
      );

    case "packed":
      return (
        <Badge className="bg-purple-500 hover:bg-purple-600 text-white">
          Packed
        </Badge>
      );

    case "shipped":
      return (
        <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white">
          Shipped
        </Badge>
      );

    case "delivered":
      return (
        <Badge className="bg-green-600 hover:bg-green-700 text-white">
          Delivered
        </Badge>
      );

    case "cancelled":
      return (
        <Badge variant="destructive">
          Cancelled
        </Badge>
      );

    default:
      return (
        <Badge variant="outline">
          {status || "Pending"}
        </Badge>
      );
  }
  }
