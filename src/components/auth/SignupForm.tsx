
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { account } from "@/integrations/appwrite/client";
import { appwriteConfigError, isAppwriteConfigured } from "@/integrations/appwrite/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface SignupFormProps {
  isLoading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const SignupForm = ({ isLoading, onSubmit }: SignupFormProps) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isAppwriteConfigured) {
      toast.error(appwriteConfigError);
      return;
    }

    setLoading(true);

    try {
      await account.create("unique()", email, password, name);
      // Immediately sign in after creating account
      await account.createEmailPasswordSession(email, password);
      toast.success("Account created successfully!");
      localStorage.setItem("isLoggedIn", "true");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="John Doe"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          placeholder="name@example.com"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || loading}
      >
        {isLoading || loading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
};

export default SignupForm;
