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
  placeholder = "Search vehicle by plate or fleet number",
  required = false,
  disabled = false,
}: VehicleInputProps) {
  const [show, setShow] = useState(false);
  const [displayValue, setDisplayValue] = useState("");

  // Compute display value from vehicle plate
  const currentDisplayValue = useMemo(() => {
    if (!value) return displayValue;
    const selectedVehicle = vehicles.find((v) => v.number_plate === value);
    return selectedVehicle ? selectedVehicle.number_plate : displayValue;
  }, [value, vehicles, displayValue]);

  // Filter vehicles - show all on focus, filter on type
  const filtered = useMemo(() => {
    if (!vehicles || vehicles.length === 0) return [];
    const q = currentDisplayValue.trim().toLowerCase();
    if (!q) return vehicles.slice(0, 8); // Show first 8 when empty
    return vehicles.filter(
      (vehicle) =>
        vehicle.number_plate.toLowerCase().includes(q)
    );
  }, [vehicles, currentDisplayValue]);

  const handleSelect = (vehicle: Vehicle) => {
    onChange(vehicle.number_plate);
    setDisplayValue(vehicle.number_plate);
    setShow(false);
  };

  return (
    <div className="relative space-y-2 mb-4">
      <Label htmlFor={id} className="flex items-center gap-2 text-white">
        Carrier
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
            // If a vehicle is already selected, typing should clear the selection
            if (value) {
              onChange("");
            }
            setShow(true);
          }}
          onFocus={() => setShow(true)}
          onBlur={() => setTimeout(() => setShow(false), 200)}
          placeholder={placeholder}
          required={required}
          disabled={disabled || isLoading}
          autoComplete="off"
          className="bg-white text-foreground"
        />
        {value && (
          <button
            type="button"
            aria-label="Clear vehicle"
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
            {filtered.map((vehicle) => (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => handleSelect(vehicle)}
                className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors"
              >
                <span className="font-medium">{vehicle.number_plate}</span>                
              </button>
            ))}
          </div>
        )}
        {show && filtered.length === 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-input rounded-md shadow-lg px-4 py-3">
            <p className="text-sm text-gray-500">No vehicles found</p>
          </div>
        )}
      </div>
    </div>
  );
}
