
import React, { useMemo, useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Trash2, Upload } from "lucide-react";
import { Form } from "@/components/ui/form";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { AddressFields } from "./AddressFields";
import { FormActions } from "./FormActions";
import { settingsFormSchema, SettingsFormValues } from "./settingsFormSchema";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/avatar";
import { account, databases, storage, DATABASE_ID, ID, Permission, Query, Role } from "@/integrations/appwrite/client";
import {
  getAvatarUrl,
  PROFILE_AVATAR_ACCEPT,
  PROFILE_AVATARS_BUCKET,
  validateProfileAvatarFile,
} from "@/lib/avatars";
import { toast } from "sonner";

interface SettingsFormProps {
  isSaving: boolean;
  onSave: (data: SettingsFormValues) => void;
}

export function SettingsForm({ isSaving, onSave }: SettingsFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatarFileId, setAvatarFileId] = useState<string | null>(null);
  const [avatarUpdatedAt, setAvatarUpdatedAt] = useState<string | null>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [selectedAvatarPreview, setSelectedAvatarPreview] = useState<string | null>(null);
  const [shouldRemoveAvatar, setShouldRemoveAvatar] = useState(false);

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
        setAvatarFileId(data?.avatar_file_id || null);
        setAvatarUpdatedAt(data?.avatar_updated_at || null);
      } catch (error: any) {
        toast.error("Failed to load profile data");
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [form]);

  useEffect(() => {
    return () => {
      if (selectedAvatarPreview) URL.revokeObjectURL(selectedAvatarPreview);
    };
  }, [selectedAvatarPreview]);

  const currentAvatarUrl = useMemo(
    () => getAvatarUrl(avatarFileId, avatarUpdatedAt),
    [avatarFileId, avatarUpdatedAt]
  );

  const displayedAvatarUrl = selectedAvatarPreview || (shouldRemoveAvatar ? undefined : currentAvatarUrl);
  const displayedName = form.watch("fullName") || "User";

  const clearSelectedAvatar = () => {
    if (selectedAvatarPreview) URL.revokeObjectURL(selectedAvatarPreview);
    setSelectedAvatarFile(null);
    setSelectedAvatarPreview(null);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validationMessage = validateProfileAvatarFile(file);
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    clearSelectedAvatar();
    setSelectedAvatarFile(file);
    setSelectedAvatarPreview(URL.createObjectURL(file));
    setShouldRemoveAvatar(false);
  };

  const handleRemoveAvatar = () => {
    clearSelectedAvatar();
    setShouldRemoveAvatar(true);
  };

  const resetAvatarDraft = () => {
    clearSelectedAvatar();
    setShouldRemoveAvatar(false);
  };

  const deleteAvatarFileBestEffort = async (fileId?: string | null) => {
    if (!fileId) return;

    try {
      await storage.deleteFile(PROFILE_AVATARS_BUCKET, fileId);
    } catch (error) {
      console.warn("Failed to delete avatar file:", error);
    }
  };

  async function onSubmit(data: SettingsFormValues) {
    let uploadedAvatarFileId: string | null = null;

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

      const previousAvatarFileId = existingProfile?.avatar_file_id || avatarFileId || null;
      const avatarTimestamp = new Date().toISOString();
      let avatarData: Record<string, string | null> = {};

      if (selectedAvatarFile) {
        const uploadedFile = await storage.createFile(
          PROFILE_AVATARS_BUCKET,
          ID.unique(),
          selectedAvatarFile,
          [
            Permission.read(Role.users()),
            Permission.update(Role.user(userId)),
            Permission.delete(Role.user(userId)),
          ]
        );
        uploadedAvatarFileId = uploadedFile.$id;
        avatarData = {
          avatar_file_id: uploadedFile.$id,
          avatar_updated_at: avatarTimestamp,
        };
      } else if (shouldRemoveAvatar && previousAvatarFileId) {
        avatarData = {
          avatar_file_id: null,
          avatar_updated_at: null,
        };
      }

      const profileData = {
        full_name: data.fullName,
        phone_number: data.phoneNumber,
        street_address: data.streetAddress,
        city: data.city,
        state: data.state,
        zip_code: data.zipCode,
        country: data.country,
        ...avatarData,
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

      if ((uploadedAvatarFileId || shouldRemoveAvatar) && previousAvatarFileId && previousAvatarFileId !== uploadedAvatarFileId) {
        await deleteAvatarFileBestEffort(previousAvatarFileId);
      }

      if (uploadedAvatarFileId) {
        setAvatarFileId(uploadedAvatarFileId);
        setAvatarUpdatedAt(avatarTimestamp);
      } else if (shouldRemoveAvatar) {
        setAvatarFileId(null);
        setAvatarUpdatedAt(null);
      }

      // Call the parent's onSave function for any additional logic
      onSave(data);
      resetAvatarDraft();
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      if (uploadedAvatarFileId) {
        await deleteAvatarFileBestEffort(uploadedAvatarFileId);
      }
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
            <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border-soft bg-surface-2/40 p-4">
              <UserAvatar
                name={displayedName}
                avatarUrl={displayedAvatarUrl}
                size={64}
                className="h-16 w-16"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm font-medium text-foreground">Profile photo</p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, or WEBP. Maximum size 5MB.
                </p>
                {shouldRemoveAvatar && (
                  <p className="text-xs text-muted-foreground">
                    Photo will be removed after saving.
                  </p>
                )}
              </div>
              {isEditing && (
                <div className="flex shrink-0 items-center gap-2">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <label className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                      <input
                        type="file"
                        accept={PROFILE_AVATAR_ACCEPT}
                        className="sr-only"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </Button>
                  {(displayedAvatarUrl || avatarFileId) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveAvatar}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
              )}
            </div>
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
            resetAvatarDraft();
            setIsEditing(false);
          }}
        />
      </form>
    </Form>
  );
}
