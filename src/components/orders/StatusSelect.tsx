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
  onChange?: (value: string) => void;
  disabled?: boolean;
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
      onValueChange={(value) => onChange?.(value)}
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
