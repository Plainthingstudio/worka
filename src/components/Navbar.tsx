
import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import InvitationNotifications from "@/components/notifications/InvitationNotifications";

interface NavbarProps {
  title: string;
  onMenuClick?: () => void;
}

const Navbar = ({ title, onMenuClick }: NavbarProps) => {
  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <InvitationNotifications />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
