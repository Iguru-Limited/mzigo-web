"use client";

import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { RouteItem } from "@/types/reference/routes";

interface RouteInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void; // store selected route id
  routes: RouteItem[];
  isLoading: boolean;
  error?: string | null;
  placeholder?: string;
  required?: boolean;
}

export function RouteInput({
  id = "receiverRoute",
  value,
  onChange,
  routes,
  isLoading,
  error,
  placeholder = "Search route by name",
  required = false,
}: RouteInputProps) {
  const [show, setShow] = useState(false);
  const [displayValue, setDisplayValue] = useState("");

  // Compute display value from route id
  const currentDisplayValue = useMemo(() => {
    if (!value) return displayValue;
    const selectedRoute = routes.find((r) => r.id === value);
    return selectedRoute ? selectedRoute.route_name : displayValue;
  }, [value, routes, displayValue]);

  const filtered = useMemo(() => {
    if (!routes || routes.length === 0) return [];
    const q = currentDisplayValue.trim().toLowerCase();
    if (!q) return routes.slice(0, 8);
    return routes.filter((r) => r.route_name.toLowerCase().includes(q));
  }, [routes, currentDisplayValue]);

  const handleSelect = (r: RouteItem) => {
    onChange(r.id);
    setDisplayValue(r.route_name);
    setShow(false);
  };

  return (
    <div className="relative space-y-2 mb-4">
      <Label htmlFor={id} className="flex items-center gap-2 text-white">
        Route
        {isLoading && <Spinner className="h-3 w-3" />}
        {error && <span className="text-xs text-red-500">({error})</span>}
      </Label>
      <div className="relative">
        <Input
          id={id}
          value={currentDisplayValue}
          onChange={(e) => {
            const next = e.target.value;
            setDisplayValue(next);
            // If a route is already selected, typing should clear the selection
            if (value) {
              onChange("");
            }
            setShow(true);
          }}
          onFocus={() => setShow(true)}
          onBlur={() => setTimeout(() => setShow(false), 200)}
          placeholder={placeholder}
          required={required}
          disabled={isLoading}
          autoComplete="off"
          className="bg-white text-foreground"
        />
        {value && (
          <button
            type="button"
            aria-label="Clear route"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onChange("");
              setDisplayValue("");
              setShow(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm px-1"
          >
            ×
          </button>
        )}
        {show && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-input rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filtered.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSelect(r)}
                className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors"
              >
                <span className="font-medium">{r.route_name}</span>
              </button>
            ))}
          </div>
        )}
        {show && filtered.length === 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-input rounded-md shadow-lg px-4 py-3">
            <p className="text-sm text-gray-500">No routes found</p>
          </div>
        )}
      </div>
    </div>
  );
}
