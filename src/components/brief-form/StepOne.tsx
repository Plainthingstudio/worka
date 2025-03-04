
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

interface StepOneProps {
  onNext: () => void;
}

const StepOne = ({ onNext }: StepOneProps) => {
  const { control, trigger } = useFormContext();

  const handleNext = async () => {
    const isValid = await trigger([
      "name", 
      "email", 
      "companyName", 
      "aboutCompany",
      "visionMission",
      "slogan"
    ]);
    
    if (isValid) {
      onNext();
    }
  };

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
        <FormField
          control={control}
          name="visionMission"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vision & Mission*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What is your company's vision and mission?" 
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
        <FormField
          control={control}
          name="slogan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slogan/Tagline*</FormLabel>
              <FormControl>
                <Input placeholder="Your company slogan or tagline" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="flex justify-end">
        <Button type="button" onClick={handleNext}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default StepOne;
