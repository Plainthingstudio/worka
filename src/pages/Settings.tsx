
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { ThemeToggle } from "@/components/ThemeToggle";

const Settings = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  
  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarChange = () => {
      const sidebarElement = document.querySelector('[class*="w-56"], [class*="w-14"]');
      setIsSidebarExpanded(sidebarElement?.classList.contains('w-56') || false);
    };

    // Initial check
    handleSidebarChange();

    // Set up mutation observer to watch for class changes on the sidebar
    const observer = new MutationObserver(handleSidebarChange);
    const sidebarElement = document.querySelector('[class*="flex flex-col border-r"]');
    
    if (sidebarElement) {
      observer.observe(sidebarElement, { attributes: true, attributeFilter: ['class'] });
    }

    return () => observer.disconnect();
  }, []);
  
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
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div 
        className={`flex-1 w-full transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? "pl-56" : "pl-14"
        }`}
      >
        <Navbar title="Settings" />
        <main className="container py-6 max-w-6xl">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Profile Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your personal information and contact details</p>
              </div>
              <ThemeToggle className="mr-2" />
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
                  value="appearance" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-4"
                >
                  Appearance
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
              
              <TabsContent value="appearance" className="w-full">
                <Card className="border shadow-sm w-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">Appearance Settings</CardTitle>
                    <CardDescription>
                      Customize how the application looks and feels
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Theme</h3>
                      <p className="text-sm text-muted-foreground">
                        Select the theme for the application
                      </p>
                      <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <span className="text-sm font-medium">
                          Switch between light and dark mode
                        </span>
                      </div>
                    </div>
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
      </div>
    </div>
  );
};

export default Settings;
