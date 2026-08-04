import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import StatusBadge from "./StatusBadge";

type Props = {
  value: string;
  options: string[];
  disabled?: boolean;
  onChange: (value: string) => void;
};

export default function StatusSelect({
  value,
  options,
  disabled,
  onChange,
}: Props) {
  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-[160px]">
        <StatusBadge status={value} />
      </SelectTrigger>

      <SelectContent>
        {options.map((status) => (
          <SelectItem
            key={status}
            value={status}
          >
            <StatusBadge status={status} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
