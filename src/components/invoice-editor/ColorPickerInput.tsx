
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Palette } from "lucide-react";

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
  const [inputValue, setInputValue] = useState(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor={`color-${label.toLowerCase().replace(/\s+/g, '-')}`}>{label}</Label>
      <div className="flex items-center gap-2">
        <div 
          className="h-10 w-10 rounded-md border"
          style={{ backgroundColor: value }} 
        />
        <div className="flex-1 relative">
          <Input
            id={`color-${label.toLowerCase().replace(/\s+/g, '-')}`}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            className="pl-10"
          />
          <Palette className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
        </div>
        <Input
          type="color"
          value={value}
          onChange={handleInputChange}
          className="w-10 p-0 border-0"
        />
      </div>
    </div>
  );
};

export default ColorPickerInput;
