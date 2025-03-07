
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CustomFormField } from "./FormField";

interface AddressFieldsProps {
  form: UseFormReturn<any>;
  isEditing: boolean;
}

export function AddressFields({ form, isEditing }: AddressFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CustomFormField
          form={form}
          name="streetAddress"
          label="Street Address"
          placeholder="123 Main St"
          disabled={!isEditing}
          className="bg-background"
        />

        <CustomFormField
          form={form}
          name="city"
          label="City"
          placeholder="San Francisco"
          disabled={!isEditing}
          className="bg-background"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CustomFormField
          form={form}
          name="state"
          label="State/Province"
          placeholder="California"
          disabled={!isEditing}
          className="bg-background"
        />

        <CustomFormField
          form={form}
          name="zipCode"
          label="Postal Code"
          placeholder="94103"
          disabled={!isEditing}
          className="bg-background"
        />
      </div>
      
      <div className="max-w-lg">
        <CustomFormField
          form={form}
          name="country"
          label="Country"
          placeholder="United States"
          disabled={!isEditing}
          className="bg-background"
        />
      </div>
    </div>
  );
}
