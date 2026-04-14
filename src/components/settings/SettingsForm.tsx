
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { AddressFields } from "./AddressFields";
import { FormActions } from "./FormActions";
import { settingsFormSchema, SettingsFormValues } from "./settingsFormSchema";
import { account, databases, DATABASE_ID, ID, Query } from "@/integrations/appwrite/client";
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

  // Fetch user profile data from Appwrite
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setLoading(true);

        // Get current session
        let session;
        try {
          session = await account.getSession('current');
        } catch {
          setLoading(false);
          return;
        }

        if (!session) {
          setLoading(false);
          return;
        }

        const userId = session.userId;

        // Get user profile from profiles collection
        let data = null;
        try {
          const response = await databases.listDocuments(DATABASE_ID, 'profiles', [
            Query.equal('$id', userId)
          ]);
          data = response.documents[0] ?? null;
        } catch (error) {
          console.error("Error fetching profile:", error);
          toast.error("Failed to load profile data");
          setLoading(false);
          return;
        }

        // Get user account info for fallback
        let userAccount;
        try {
          userAccount = await account.get();
        } catch {
          userAccount = null;
        }

        // Populate form with user data or use account data for new users
        form.reset({
          fullName: data?.full_name || userAccount?.name || "",
          email: data?.email || userAccount?.email || "",
          phoneNumber: data?.phone_number || "",
          streetAddress: data?.street_address || "",
          city: data?.city || "",
          state: data?.state || "",
          zipCode: data?.zip_code || "",
          country: data?.country || "",
        });
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
      // Get current session
      let session;
      try {
        session = await account.getSession('current');
      } catch {
        toast.error("You must be logged in to update your profile");
        return;
      }

      if (!session) {
        toast.error("You must be logged in to update your profile");
        return;
      }

      const userId = session.userId;

      // Get user email for profile
      let userEmail = data.email;
      try {
        const userAccount = await account.get();
        userEmail = userAccount.email || data.email;
      } catch {
        // use form email
      }

      // Check if profile exists
      let existingProfile = null;
      try {
        const response = await databases.listDocuments(DATABASE_ID, 'profiles', [
          Query.equal('$id', userId)
        ]);
        existingProfile = response.documents[0] ?? null;
      } catch {
        // profile doesn't exist
      }

      const profileData = {
        full_name: data.fullName,
        phone_number: data.phoneNumber,
        street_address: data.streetAddress,
        city: data.city,
        state: data.state,
        zip_code: data.zipCode,
        country: data.country,
      };

      if (existingProfile) {
        // Update existing profile
        await databases.updateDocument(DATABASE_ID, 'profiles', userId, profileData);
      } else {
        // Insert new profile for new user
        await databases.createDocument(DATABASE_ID, 'profiles', userId, {
          ...profileData,
          email: userEmail,
        });
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
