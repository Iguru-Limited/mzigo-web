"use client";

import { Label } from "@/components/ui/label";
import { Size } from "@/types/sizes";

interface SizeSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  sizes: Size[];
  isLoading: boolean;
  error?: string | null;
  required?: boolean;
}

export function SizeSelect({
  id = "packageSize",
  value,
  onChange,
  sizes,
  isLoading,
  error,
  required = false,
}: SizeSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Package Size</Label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 bg-white text-black rounded border border-input"
        disabled={isLoading}
      >
        <option value="">Select Size</option>
        {sizes.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
