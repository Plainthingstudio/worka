
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CustomFormField } from "./FormField";

interface PersonalInfoFieldsProps {
  form: UseFormReturn<any>;
  isEditing: boolean;
}

export function PersonalInfoFields({ form, isEditing }: PersonalInfoFieldsProps) {
  return (
    <div className="space-y-4">
      <CustomFormField
        form={form}
        name="fullName"
        label="Full Name"
        placeholder="Your Name"
        disabled={!isEditing}
      />

      <CustomFormField
        form={form}
        name="email"
        label="Email"
        placeholder="name@example.com"
        disabled={true}
        description="Email address is managed by your account settings and cannot be changed here."
      />

      <CustomFormField
        form={form}
        name="phoneNumber"
        label="Phone Number"
        placeholder="+1 (555) 000-0000"
        disabled={!isEditing}
      />
    </div>
  );
}
