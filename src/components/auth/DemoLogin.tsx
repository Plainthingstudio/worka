
import React from "react";
import { Button } from "@/components/ui/button";

interface DemoLoginProps {
  isLoading: boolean;
  onDemoLogin: () => void;
}

const DemoLogin = ({ isLoading, onDemoLogin }: DemoLoginProps) => {
  return (
    <div className="mt-6 flex flex-col space-y-3">
      <Button
        onClick={onDemoLogin}
        className="w-full"
        disabled={isLoading}
        variant="default"
      >
        {isLoading ? "Logging in..." : "Login with Demo Account"}
      </Button>
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with credentials
          </span>
        </div>
      </div>
    </div>
  );
};

export default DemoLogin;
