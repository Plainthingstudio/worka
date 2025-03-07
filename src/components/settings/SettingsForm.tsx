
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { AddressFields } from "./AddressFields";
import { FormActions } from "./FormActions";
import { settingsFormSchema, SettingsFormValues, defaultValues } from "./settingsFormSchema";

interface SettingsFormProps {
  isSaving: boolean;
  onSave: (data: SettingsFormValues) => void;
}

export function SettingsForm({ isSaving, onSave }: SettingsFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Initialize form with default values
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues,
  });

  // Load user settings from localStorage if available
  useEffect(() => {
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      form.reset(parsedSettings);
    }
  }, [form]);

  function onSubmit(data: SettingsFormValues) {
    onSave(data);
    setIsEditing(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight text-foreground border-b pb-2">Personal Information</h3>
            <PersonalInfoFields form={form} isEditing={isEditing} />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight text-foreground border-b pb-2">Address Information</h3>
            <AddressFields form={form} isEditing={isEditing} />
          </div>
        </div>

        <FormActions 
          isEditing={isEditing} 
          isSaving={isSaving} 
          onEdit={() => setIsEditing(true)} 
          onCancel={() => {
            form.reset();
            setIsEditing(false);
          }} 
        />
      </form>
    </Form>
  );
}
