"use client";

import { useState, useMemo } from "react";
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
}

/**
 * Destination input component with autocomplete suggestions
 * Provides type-ahead suggestions based on destination name
 */
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
}: DestinationInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter destinations based on input
  const filteredDestinations = useMemo(() => {
    if (!value.trim()) return [];

    const searchTerm = value.toLowerCase();
    return destinations.filter((destination) =>
      destination.name.toLowerCase().includes(searchTerm)
    );
  }, [value, destinations]);

  const handleSelect = (destination: Destination) => {
    onChange(destination.name);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow click on suggestion
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleFocus = () => {
    if (value.trim()) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative space-y-2 w-full">
      <Label htmlFor={id} className="flex items-center gap-2 text-white">
        Destination
        {isLoading && <Spinner className="h-3 w-3" />}
        {error && <span className="text-xs text-red-500">({error})</span>}
      </Label>
      <div className="relative w-full">
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
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredDestinations.length > 0 && (
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
                  <span className="text-xs text-gray-500">
                    {/* Route #{destination.route} */}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {/* 📞 {destination.phone_number} */}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No results message */}
        {showSuggestions && value.trim() && filteredDestinations.length === 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-input rounded-md shadow-lg px-4 py-3">
            <p className="text-sm text-gray-500">No destinations found</p>
          </div>
        )}
      </div>
    </div>
  );
}
