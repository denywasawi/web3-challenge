"use client";

import { OptionType } from "@/types/global";
import { Avatar, Select, SelectItem } from "@nextui-org/react";
import { useMemo } from "react";

export interface Props {
  label: string;
  data: OptionType[];
  onChange: (value: string) => void;
  value?: string;
  className?: string;
}

export default function Dropdown(props: Readonly<Props>) {
  const { label, data, onChange, value, className } = props;

  const selected = useMemo(
    () => data.find((e) => e.value === value),
    [data, value]
  );

  return (
    <Select
      className={className}
      label={label}
      onChange={(e) => onChange(e.target.value)}
      value={value}
      startContent={
        selected?.icon && (
          <Avatar
            alt={selected?.label}
            className="w-6 h-6"
            src={selected?.icon}
          />
        )
      }
    >
      {data.map((e) => (
        <SelectItem
          value={e.value}
          key={e.value}
          startContent={
            <Avatar alt={e.label} className="w-6 h-6" src={e.icon} />
          }
        >
          {e.label}
        </SelectItem>
      ))}
    </Select>
  );
}
