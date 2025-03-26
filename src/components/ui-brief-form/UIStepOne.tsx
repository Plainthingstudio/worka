
import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UIStepOneProps {
  onNext: () => void;
}

const UIStepOne = ({ onNext }: UIStepOneProps) => {
  const { control, register, formState: { errors }, trigger } = useFormContext();

  const handleNext = async () => {
    const isValid = await trigger([
      "name", 
      "email", 
      "companyName", 
      "aboutCompany",
      "projectType",
      "projectSize"
    ]);
    
    if (isValid) {
      onNext();
    }
  };

  const projectTypes = [
    "Website Redesign",
    "New Website",
    "Web Application",
    "Mobile App UI",
    "E-commerce Platform",
    "Dashboard UI",
    "Landing Page",
    "Design System",
    "Other"
  ];

  const projectSizes = [
    "Small (1-5 screens)",
    "Medium (6-15 screens)",
    "Large (16-30 screens)",
    "Enterprise (30+ screens)"
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium">Contact & Company Information</h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="space-y-2">
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Email*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <FormField
          control={control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name*</FormLabel>
              <FormControl>
                <Input placeholder="Enter your company name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="space-y-2">
        <FormField
          control={control}
          name="aboutCompany"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About Your Company*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Briefly describe your company, product, or service" 
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <FormField
            control={control}
            name="projectType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Type*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projectTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="space-y-2">
          <FormField
            control={control}
            name="projectSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Size*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projectSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <FormField
          control={control}
          name="currentWebsite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Website URL (if any)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <h3 className="text-lg font-medium">Competitor Websites/Apps</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <FormField
              control={control}
              name={`competitor${i}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Competitor {i}</FormLabel>
                  <FormControl>
                    <Input placeholder={`https://competitor${i}.com`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
      </div>
      
      <div className="flex justify-end">
        <Button type="button" onClick={handleNext}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default UIStepOne;
