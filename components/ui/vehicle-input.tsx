"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Vehicle } from "@/types/reference/vehicles";

interface VehicleInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  vehicles: Vehicle[];
  isLoading: boolean;
  error?: string | null;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Vehicle input component with autocomplete suggestions
 * Provides type-ahead suggestions based on number_plate or fleet_number
 */
export function VehicleInput({
  id = "vehiclePlate",
  value,
  onChange,
  vehicles,
  isLoading,
  error,
  placeholder = "e.g., KAA 123B or fleet number",
  required = false,
  disabled = false,
}: VehicleInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter vehicles based on input
  const filteredVehicles = useMemo(() => {
    if (!value.trim()) return [];

    const searchTerm = value.toLowerCase();
    return vehicles.filter(
      (vehicle) =>
        vehicle.number_plate.toLowerCase().includes(searchTerm) ||
        vehicle.fleet_number.toLowerCase().includes(searchTerm)
    );
  }, [value, vehicles]);

  const handleSelect = (vehicle: Vehicle) => {
    onChange(vehicle.number_plate);
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
    <div className="relative space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2 text-white">
        carrier
        {isLoading && <Spinner className="h-3 w-3" />}
        {error && <span className="text-xs text-red-500">({error})</span>}
      </Label>
      <div className="relative">
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
        {showSuggestions && filteredVehicles.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-input rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filteredVehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => handleSelect(vehicle)}
                className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{vehicle.number_plate}</span>
                  <span className="text-xs text-gray-500">
                    {/* Fleet #{vehicle.fleet_number} */}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {/* {vehicle.active_status === "1" ? "✓ Active" : "Inactive"} •{" "} */}
                  {/* {vehicle.load_count} loads */}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No results message */}
        {showSuggestions && value.trim() && filteredVehicles.length === 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-input rounded-md shadow-lg px-4 py-3">
            <p className="text-sm text-gray-500">No vehicles found</p>
          </div>
        )}
      </div>
    </div>
  );
}
