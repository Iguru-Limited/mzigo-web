"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Destination } from "@/types/reference/destinations";

interface DestinationInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  destinations: Destination[];
  isLoading: boolean;
  error?: string | null;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  allowCustom?: boolean;
  requireRoute?: boolean;
}

export function DestinationInput({
  id = "destination",
  value,
  onChange,
  destinations,
  isLoading,
  error,
  placeholder = "Search destination by name",
  required = false,
  disabled = false,
  allowCustom = true,
  requireRoute = false,
}: DestinationInputProps) {
  const [show, setShow] = useState(false);
  const [displayValue, setDisplayValue] = useState("");
  const [forceCustom, setForceCustom] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) setForceCustom(false);
  }, [value]);

  // Compute display value from destination name
  const currentDisplayValue = useMemo(() => {
    if (!value) return displayValue;
    const selectedDestination = destinations.find((d) => d.name === value);
    return selectedDestination ? selectedDestination.name : value; // Allow custom values
  }, [value, destinations, displayValue]);

  // Filter destinations - show all on focus, filter on type
  const filtered = useMemo(() => {
    if (!destinations || destinations.length === 0) return [];
    const q = currentDisplayValue.trim().toLowerCase();
    if (!q) return destinations.slice(0, 8); // Show first 8 when empty
    return destinations.filter((d) => d.name.toLowerCase().includes(q));
  }, [destinations, currentDisplayValue]);

  const handleSelect = (d: Destination) => {
    onChange(d.name);
    setDisplayValue(d.name);
    setShow(false);
    setForceCustom(false);
  };

  return (
    <div className="relative space-y-2 mb-4">
      <Label htmlFor={id} className="flex items-center gap-2 text-white">
        Destination
        {requireRoute && <span className="text-xs text-yellow-300">(Route required)</span>}
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
            onChange(next); // Allow typing custom values
            if (!forceCustom) setShow(true);
          }}
          onFocus={() => !forceCustom && setShow(true)}
          onBlur={() => setTimeout(() => setShow(false), 200)}
          placeholder={placeholder}
          required={required}
          disabled={disabled || isLoading}
          autoComplete="off"
          className="bg-white text-foreground"
          ref={inputRef}
        />
        {value && (
          <button
            type="button"
            aria-label="Clear destination"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onChange("");
              setDisplayValue("");
              setShow(false);
              setForceCustom(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm px-1"
          >
            ×
          </button>
        )}
        {show && !forceCustom && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-input rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filtered.map((destination) => (
              <button
                key={destination.id}
                type="button"
                onClick={() => handleSelect(destination)}
                className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors"
              >
                <span className="font-medium">{destination.name}</span>
              </button>
            ))}
            {allowCustom && (
              <button
                type="button"
                onClick={() => {
                  setForceCustom(true);
                  setShow(false);
                  inputRef.current?.focus();
                }}
                className="w-full text-left px-4 py-2 border-t hover:bg-gray-50 text-sm text-gray-700"
              >
                Other… (type custom destination)
              </button>
            )}
          </div>
        )}
        {show && !forceCustom && filtered.length === 0 && !allowCustom && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-input rounded-md shadow-lg px-4 py-3">
            <p className="text-sm text-gray-500">No destinations found</p>
          </div>
        )}
        {forceCustom && (
          <div className="mt-1 text-xs text-gray-200">
            Using custom destination.{" "}
            <button
              type="button"
              className="underline"
              onClick={() => {
                setForceCustom(false);
                if (value) setShow(true);
              }}
            >
              Use list
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
