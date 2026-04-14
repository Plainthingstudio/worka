
import React, { memo } from "react";
import { Button } from "@/components/ui/button";

interface DemoLoginProps {
  isLoading: boolean;
  onDemoLogin: () => void;
}

const DemoLogin = memo(({ isLoading, onDemoLogin }: DemoLoginProps) => {
  return (
    <div className="mt-6 flex flex-col space-y-3">
      <Button
        onClick={() => void onDemoLogin()}
        className="w-full"
        disabled={isLoading}
        variant="default"
      >
        {isLoading ? "Logging in..." : "Continue with Demo Account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        No registration required
      </p>
    </div>
  );
});

DemoLogin.displayName = "DemoLogin";

export default DemoLogin;
