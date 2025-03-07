
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define form schema
const settingsFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address.").optional(),
  phoneNumber: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface SettingsFormProps {
  isSaving: boolean;
  onSave: (data: SettingsFormValues) => void;
}

export function SettingsForm({ isSaving, onSave }: SettingsFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Initialize form with default values
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      fullName: "",
      email: "demo@example.com", // Read-only
      phoneNumber: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });

  // Load user settings from localStorage if available
  useEffect(() => {
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      form.reset(parsedSettings);
    }
  }, [form]);

  function onSubmit(data: SettingsFormValues) {
    onSave(data);
    setIsEditing(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Full Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Your Name"
                    disabled={!isEditing}
                    className="w-full max-w-lg"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="name@example.com"
                    disabled={true}
                    className="w-full max-w-lg"
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground mt-1">
                  Email address is managed by your account settings and cannot be changed here.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Phone Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="+1 (555) 000-0000"
                    disabled={!isEditing}
                    className="w-full max-w-lg"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="streetAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Street Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="123 Main St"
                    disabled={!isEditing}
                    className="w-full max-w-lg"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">City</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="City"
                      disabled={!isEditing}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">State</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="State"
                      disabled={!isEditing}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">ZIP Code</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="ZIP Code"
                      disabled={!isEditing}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Country</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Country"
                      disabled={!isEditing}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          {!isEditing ? (
            <Button 
              type="button" 
              onClick={() => setIsEditing(true)}
              className="gap-2"
            >
              <Pencil size={16} />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
}
