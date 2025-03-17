
import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { EyeDropper } from "lucide-react";

interface ColorPickerInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorPickerInput: React.FC<ColorPickerInputProps> = ({
  label,
  value,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Standard colors for quick access
  const predefinedColors = [
    "#1A1F2C", "#7E69AB", "#9b87f5", "#D6BCFA", 
    "#F97316", "#0EA5E9", "#D946EF", "#F43F5E",
    "#8B5CF6", "#10B981", "#6366F1", "#EC4899"
  ];

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={`color-${label}`}>{label}</Label>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <div
              className="h-8 w-8 rounded-md border border-border shadow-sm"
              style={{ backgroundColor: value }}
            />
            <input
              type="text"
              id={`color-${label}`}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex h-9 w-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <div className="rounded-md border border-border p-1">
              <EyeDropper className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </PopoverTrigger>
        
        <PopoverContent className="w-64" align="start">
          <div className="grid gap-4">
            <div>
              <div className="mb-2 text-xs font-medium">Custom color</div>
              <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-8 cursor-pointer rounded-md"
              />
            </div>
            
            <div>
              <div className="mb-2 text-xs font-medium">Quick colors</div>
              <div className="grid grid-cols-6 gap-2">
                {predefinedColors.map((color) => (
                  <div
                    key={color}
                    className="h-6 w-6 rounded-md cursor-pointer hover:scale-110 transition-transform border border-border"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      onChange(color);
                      setIsOpen(false);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ColorPickerInput;
