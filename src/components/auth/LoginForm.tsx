
import React, { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isLoading: boolean;
  loginRateLimitRemainingSeconds: number;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const formatRemainingTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// Use memo to prevent unnecessary re-renders
const LoginForm = memo(({
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
  loginRateLimitRemainingSeconds,
  onSubmit,
}: LoginFormProps) => {
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          placeholder="name@example.com"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={handleEmailChange}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Button
            variant="link"
            className="h-auto p-0 text-xs font-normal"
            type="button"
          >
            Forgot password?
          </Button>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={handlePasswordChange}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="remember" 
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked === true)}
        />
        <Label htmlFor="remember" className="text-sm">Remember me</Label>
      </div>
      {loginRateLimitRemainingSeconds > 0 && (
        <p
          className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          role="status"
          aria-live="polite"
        >
          Terlalu banyak percobaan login. Coba lagi dalam {formatRemainingTime(loginRateLimitRemainingSeconds)}.
        </p>
      )}
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || loginRateLimitRemainingSeconds > 0}
      >
        {isLoading
          ? "Logging in..."
          : loginRateLimitRemainingSeconds > 0
            ? `Coba lagi dalam ${formatRemainingTime(loginRateLimitRemainingSeconds)}`
            : "Login"}
      </Button>
    </form>
  );
});

LoginForm.displayName = "LoginForm";

export default LoginForm;
