
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="container max-w-6xl py-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Settings</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <SettingsForm isSaving={isSaving} onSave={handleSaveSettings} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Manage your account settings, change password, and connected applications.</p>
                <div className="mt-6">
                  <p>Account settings functionality coming soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Configure how you receive notifications from the system.</p>
                <div className="mt-6">
                  <p>Notification settings functionality coming soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
