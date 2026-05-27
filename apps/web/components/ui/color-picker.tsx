"use client";

import * as React from "react";
import { HexAlphaColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Input } from "./input";
import { cn } from "~/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

// Simple fallback to parsing rgba/hex to hex-alpha for react-colorful
// `react-colorful` HexAlphaColorPicker natively works with #rrggbbaa
// If a user types rgba(255,255,255,1), we should ideally parse it, but for simplicity
// we will just encourage them to use the picker which outputs hex-alpha.
// HexAlphaColorPicker handles #RRGGBB and #RRGGBBAA strings.

export function ColorPicker({ value, onChange, className, placeholder }: ColorPickerProps) {
  const [open, setOpen] = React.useState(false);
  const color = value || "#00000000"; // fallback

  return (
    <div className={cn("flex gap-2 w-full items-center", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[50px] h-10 p-1 shrink-0 overflow-hidden"
          >
            <div 
              className="w-full h-full rounded shadow-sm border border-black/10"
              style={{ backgroundColor: color }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4 rounded-xl border" align="start">
          <HexAlphaColorPicker color={color} onChange={onChange} />
          <div className="mt-3 text-center text-xs text-muted-foreground">
            Pick a color (Opacity supported)
          </div>
        </PopoverContent>
      </Popover>
      
      <Input
        type="text"
        placeholder={placeholder ?? "e.g. #ffffff"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1"
      />
    </div>
  );
}
