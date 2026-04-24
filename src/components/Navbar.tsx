
import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import InvitationNotifications from "@/components/notifications/InvitationNotifications";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

interface NavbarProps {
  title: string;
  onMenuClick?: () => void;
}

const Navbar = ({ title, onMenuClick }: NavbarProps) => {
  return (
    <header
      className="bg-card border-b border-border-soft"
      style={{ height: 53 }}
    >
      <div className="flex h-full items-center justify-between" style={{ padding: "0 24px" }}>
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
          <h1
            className="text-foreground"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: 18,
              lineHeight: "135%",
              letterSpacing: "-0.03em",
            }}
          >
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <NotificationCenter />
          <InvitationNotifications />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
