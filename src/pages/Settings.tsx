import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SettingsForm } from "@/components/settings/SettingsForm";
import GoogleCalendarSettings from "@/components/settings/GoogleCalendarSettings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { SettingsFormValues } from "@/components/settings/settingsFormSchema";

const SETTINGS_TABS = ["profile", "account", "integrations", "notifications"] as const;

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSaving, setIsSaving] = useState(false);
  const activeTab = useMemo(() => {
    const queryTab = searchParams.get("tab");
    return SETTINGS_TABS.includes(queryTab as (typeof SETTINGS_TABS)[number]) ? queryTab! : "profile";
  }, [searchParams]);

  const handleSaveSettings = async (formData: SettingsFormValues) => {
    setIsSaving(true);
    try {
      // The actual saving happens in the SettingsForm component
      // This function is for any additional logic needed in the future
      setIsSaving(false);
    } catch (error) {
      toast.error("An error occurred while saving settings");
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const googleCalendarStatus = searchParams.get("googleCalendar");
    const googleCalendarMessage = searchParams.get("googleCalendarMessage");
    if (!googleCalendarStatus) return;

    if (googleCalendarStatus === "connected") {
      toast.success("Google Calendar connected successfully.");
    } else if (googleCalendarStatus === "error") {
      toast.error(
        googleCalendarMessage ||
          "Google Calendar connection failed. Check Appwrite Function logs and Google OAuth settings."
      );
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("googleCalendar");
    nextParams.delete("googleCalendarMessage");
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  return <main className="container py-6 max-w-6xl px-[24px]">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl tracking-tight md:text-2xl font-semibold">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your profile, connected apps, and account preferences</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={(value) => setSearchParams({ tab: value })} className="w-full">
          <TabsList className="mb-6 w-full max-w-full flex-wrap justify-start sm:w-auto">
            <TabsTrigger value="profile">
              Profile
            </TabsTrigger>
            <TabsTrigger value="account">
              Account
            </TabsTrigger>
            <TabsTrigger value="integrations">
              Integrations
            </TabsTrigger>
            <TabsTrigger value="notifications">
              Notifications
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="w-full">
            <Card className="border shadow-sm w-full">
              <CardContent className="p-6">
                <SettingsForm isSaving={isSaving} onSave={handleSaveSettings} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account" className="w-full">
            <Card className="border shadow-sm w-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Account Settings</CardTitle>
                <CardDescription>
                  Manage account-level preferences and connected applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <p className="text-muted-foreground">Additional account controls will land here next.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="w-full">
            <div className="space-y-6">
              <Card className="border shadow-sm w-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">Connected Apps</CardTitle>
                  <CardDescription>
                    Connect external tools that power dashboard automations and daily workflow visibility
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <GoogleCalendarSettings />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="w-full">
            <Card className="border shadow-sm w-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how you receive notifications from the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <p className="text-muted-foreground">Notification settings functionality coming soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>;
};
export default Settings;
