
import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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
      "aboutCompany"
    ]);
    
    if (isValid) {
      onNext();
    }
  };

  const websiteTypes = [
    { value: "agency", label: "Agency Website" },
    { value: "portfolio", label: "Portfolio Website" },
    { value: "finance", label: "Finance Website" },
    { value: "saas", label: "SaaS Website" },
    { value: "ecommerce", label: "E-commerce Website" },
    { value: "web3", label: "Web3 Website" },
    { value: "crypto", label: "Crypto Website" },
    { value: "webapp", label: "Web Application" },
    { value: "desktopapp", label: "Desktop Application" },
    { value: "mobileapp", label: "Mobile Application" },
    { value: "other", label: "Other" },
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
      
      <div className="space-y-2">
        <FormLabel>Website/App Type Interest</FormLabel>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {websiteTypes.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox 
                id={`websiteType-${type.value}`} 
                {...register(`websiteTypeInterest.${type.value}`)} 
              />
              <label 
                htmlFor={`websiteType-${type.value}`}
                className="text-sm cursor-pointer"
              >
                {type.label}
              </label>
            </div>
          ))}
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
