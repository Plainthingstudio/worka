
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CustomFormField } from "./FormField";

interface PersonalInfoFieldsProps {
  form: UseFormReturn<any>;
  isEditing: boolean;
}

export function PersonalInfoFields({ form, isEditing }: PersonalInfoFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CustomFormField
          form={form}
          name="fullName"
          label="Full Name"
          placeholder="Your Name"
          disabled={!isEditing}
          className="bg-background"
        />

        <CustomFormField
          form={form}
          name="phoneNumber"
          label="Phone Number"
          placeholder="+1 (555) 000-0000"
          disabled={!isEditing}
          className="bg-background"
        />
      </div>
      
      <CustomFormField
        form={form}
        name="email"
        label="Email"
        placeholder="name@example.com"
        disabled={true}
        description="Email address is managed by your account settings and cannot be changed here."
        className="bg-background max-w-lg"
      />
    </div>
  );
}
