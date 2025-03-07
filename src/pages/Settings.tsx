
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSaveSettings = async (formData: any) => {
    setIsSaving(true);
    // Simulate saving to backend
    setTimeout(() => {
      // Store user data in localStorage
      localStorage.setItem("userSettings", JSON.stringify(formData));
      setIsSaving(false);
      toast.success("Settings saved successfully");
    }, 500);
  };
  
  return (
    <Layout>
      <div className="container py-6 px-4 md:px-6">
        <div className="flex flex-col gap-4 md:gap-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-4 md:mb-6 w-full sm:w-auto border-b flex flex-wrap h-auto">
              <TabsTrigger value="profile" className="flex-1 sm:flex-none py-2 px-6">Profile</TabsTrigger>
              <TabsTrigger value="account" className="flex-1 sm:flex-none py-2 px-6">Account</TabsTrigger>
              <TabsTrigger value="notifications" className="flex-1 sm:flex-none py-2 px-6">Notifications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="w-full">
              <Card className="border shadow-sm w-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl md:text-2xl">Profile Settings</CardTitle>
                  <CardDescription>
                    Manage your personal information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SettingsForm isSaving={isSaving} onSave={handleSaveSettings} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="account" className="w-full">
              <Card className="border shadow-sm w-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl md:text-2xl">Account Settings</CardTitle>
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
                  <CardTitle className="text-xl md:text-2xl">Notification Preferences</CardTitle>
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
      </div>
    </Layout>
  );
};

export default Settings;
