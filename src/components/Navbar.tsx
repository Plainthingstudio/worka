
import React from "react";
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

const Navbar = ({ title }: { title?: string }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      // First clear localStorage to immediately prevent protected routes access
      localStorage.removeItem("isLoggedIn");
      
      // Then perform the actual sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast.success("Successfully logged out");
      
      // Use navigate with replace to avoid back button issues
      navigate("/auth", { replace: true });
    } catch (error: any) {
      toast.error(error.message || "Failed to log out");
      console.error("Logout error:", error);
    }
  };

  return (
    <header className={`sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border px-4 backdrop-blur-md ${
      theme === "dark" ? "bg-background/60 border-border/40 shadow-md shadow-black/5" : "bg-white/80"
    }`}>
      <div className="flex items-center">
        <h1 className="text-xl font-semibold tracking-tight">{title || "Studio Manager"}</h1>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 dark:hover:bg-accent/20">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20">
                  SM
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">Studio Manager</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 dark:border-border/40 dark:bg-background/95 dark:backdrop-blur-md">
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
