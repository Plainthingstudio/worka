
import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface FormFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder: string;
  disabled?: boolean;
  description?: string;
  className?: string;
}

export function CustomFormField({
  form,
  name,
  label,
  placeholder,
  disabled = false,
  description,
  className,
}: FormFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              placeholder={placeholder}
              disabled={disabled}
              className={`${className} ${disabled ? 'opacity-80' : ''} bg-background border-input`}
            />
          </FormControl>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
