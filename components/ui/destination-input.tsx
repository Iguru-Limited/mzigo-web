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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [forceCustom, setForceCustom] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) setForceCustom(false);
  }, [value]);

  const filteredDestinations = useMemo(() => {
    if (!value.trim()) return [];
    const searchTerm = value.toLowerCase();
    return destinations.filter((d) => d.name.toLowerCase().includes(searchTerm));
  }, [value, destinations]);

  const handleSelect = (d: Destination) => {
    onChange(d.name);
    setShowSuggestions(false);
    setForceCustom(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    if (!forceCustom) setShowSuggestions(true);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleFocus = () => {
    if (!forceCustom && value.trim()) setShowSuggestions(true);
  };

  return (
    <div className="relative space-y-2 w-full mb-4 overflow-visible">
      <Label htmlFor={id} className="flex items-center gap-2 text-white">
        Destination
        {requireRoute && <span className="text-xs text-yellow-300">(Route required)</span>}
        {isLoading && <Spinner className="h-3 w-3" />}
        {error && <span className="text-xs text-red-500">({error})</span>}
      </Label>
      <div className="relative w-full overflow-visible">
        <Input
          id={id}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          disabled={disabled || isLoading}
          className="w-full bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          autoComplete="off"
          ref={inputRef}
        />

        {showSuggestions && !forceCustom && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-input rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filteredDestinations.map((destination) => (
              <button
                key={destination.id}
                type="button"
                onClick={() => handleSelect(destination)}
                className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{destination.name}</span>
                </div>
              </button>
            ))}
            {filteredDestinations.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500">No destinations found</div>
            )}
            {allowCustom && (
              <button
                type="button"
                onClick={() => {
                  setForceCustom(true);
                  setShowSuggestions(false);
                  inputRef.current?.focus();
                }}
                className="w-full text-left px-4 py-2 border-t hover:bg-gray-50 text-sm text-gray-700"
              >
                Other… (type custom destination)
              </button>
            )}
          </div>
        )}

        {forceCustom && (
          <div className="mt-1 text-xs text-gray-200">
            Using custom destination. {" "}
            <button
              type="button"
              className="underline"
              onClick={() => {
                setForceCustom(false);
                if (value) setShowSuggestions(true);
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
