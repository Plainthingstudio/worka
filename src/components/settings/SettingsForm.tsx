
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { AddressFields } from "./AddressFields";
import { FormActions } from "./FormActions";
import { settingsFormSchema, SettingsFormValues } from "./settingsFormSchema";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SettingsFormProps {
  isSaving: boolean;
  onSave: (data: SettingsFormValues) => void;
}

export function SettingsForm({ isSaving, onSave }: SettingsFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Initialize form with empty values, will be populated after fetching
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    }
  });

  // Fetch user profile data from Supabase
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          return;
        }
        
        // Get user profile from profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Populate form with user data
          form.reset({
            fullName: data.full_name || "",
            email: data.email || session.user.email || "",
            phoneNumber: data.phone_number || "",
            streetAddress: data.street_address || "",
            city: data.city || "",
            state: data.state || "",
            zipCode: data.zip_code || "",
            country: data.country || "",
          });
        }
      } catch (error: any) {
        toast.error("Failed to load profile data");
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserProfile();
  }, [form]);

  async function onSubmit(data: SettingsFormValues) {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to update your profile");
        return;
      }
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          phone_number: data.phoneNumber,
          street_address: data.streetAddress,
          city: data.city,
          state: data.state,
          zip_code: data.zipCode,
          country: data.country,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);
      
      if (error) {
        throw error;
      }
      
      // Call the parent's onSave function for any additional logic
      onSave(data);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    }
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
            // Reset form to server data
            form.reset();
            setIsEditing(false);
          }} 
        />
      </form>
    </Form>
  );
}
