import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { SettingsFormValues } from "@/components/settings/settingsFormSchema";

const Settings = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  
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
  
  return (
    <main className="container py-6 max-w-6xl">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your personal information and contact details</p>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6 w-full sm:w-auto h-auto bg-background border-b rounded-none p-0 justify-start">
            <TabsTrigger 
              value="profile" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-4"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="account" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-4"
            >
              Account
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-4"
            >
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
                  Manage your account settings, change password, and connected applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <p className="text-muted-foreground">Account settings functionality coming soon.</p>
                </div>
              </CardContent>
            </Card>
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
    </main>
  );
};

export default Settings;