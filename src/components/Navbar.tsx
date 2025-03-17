
import React, { useEffect, useState } from "react";
import { LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = ({ title }: { title?: string }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");
  const [userInitials, setUserInitials] = useState<string>("SM");
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const getUserProfile = async () => {
      try {
        // Get current user session
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Try to get user profile from profiles table
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error("Error fetching profile:", error);
            return;
          }

          if (data && data.full_name) {
            setUserName(data.full_name);
            
            // Create initials from full name
            const nameParts = data.full_name.split(' ');
            const initials = nameParts.length > 1 
              ? `${nameParts[0][0]}${nameParts[1][0]}`
              : data.full_name.substring(0, 2);
            
            setUserInitials(initials.toUpperCase());
          } else {
            // Use email as fallback
            setUserName(user.email || "Studio Manager");
            // Create initials from email
            if (user.email) {
              const emailName = user.email.split('@')[0];
              setUserInitials(emailName.substring(0, 2).toUpperCase());
            }
          }
        }
      } catch (error) {
        console.error("Error getting user info:", error);
      }
    };

    getUserProfile();
  }, []);
  
  const handleLogout = async () => {
    try {
      // First clear localStorage to immediately update UI state
      localStorage.removeItem("isLoggedIn");
      
      // Use navigate with replace to avoid back button issues
      // Do this before the async operation to ensure immediate UI response
      navigate("/auth", { replace: true });
      
      // Then perform the actual sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast.success("Successfully logged out");
    } catch (error: any) {
      toast.error(error.message || "Failed to log out");
      console.error("Logout error:", error);
    }
  };

  return (
    <header className={`sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border px-2 sm:px-4 md:px-6 backdrop-blur-md ${
      theme === "dark" ? "bg-background/60 border-border/40 shadow-md shadow-black/5" : "bg-white/80"
    }`}>
      <div className="flex items-center">
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight truncate max-w-[220px] sm:max-w-none">
          {title || "Studio Manager"}
        </h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 dark:hover:bg-accent/20 px-1 sm:px-2">
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20 text-xs sm:text-sm">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs sm:text-sm font-medium hidden xs:inline">
                {userName || "Studio Manager"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 sm:w-56 dark:border-border/40 dark:bg-background/95 dark:backdrop-blur-md">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="dark:bg-border/40" />
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex w-full cursor-pointer items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex w-full cursor-pointer items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="dark:bg-border/40" />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Navbar;
