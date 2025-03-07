
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CustomFormField } from "./FormField";

interface AddressFieldsProps {
  form: UseFormReturn<any>;
  isEditing: boolean;
}

export function AddressFields({ form, isEditing }: AddressFieldsProps) {
  return (
    <div className="space-y-4">
      <CustomFormField
        form={form}
        name="streetAddress"
        label="Street Address"
        placeholder="123 Main St"
        disabled={!isEditing}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CustomFormField
          form={form}
          name="city"
          label="City"
          placeholder="City"
          disabled={!isEditing}
          className="w-full"
        />

        <CustomFormField
          form={form}
          name="state"
          label="State"
          placeholder="State"
          disabled={!isEditing}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CustomFormField
          form={form}
          name="zipCode"
          label="ZIP Code"
          placeholder="ZIP Code"
          disabled={!isEditing}
          className="w-full"
        />

        <CustomFormField
          form={form}
          name="country"
          label="Country"
          placeholder="Country"
          disabled={!isEditing}
          className="w-full"
        />
      </div>
    </div>
  );
}
