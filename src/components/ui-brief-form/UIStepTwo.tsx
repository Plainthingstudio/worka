
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
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

interface UIStepTwoProps {
  onNext: () => void;
  onPrevious: () => void;
}

const UIStepTwo = ({ onNext, onPrevious }: UIStepTwoProps) => {
  const { control, trigger } = useFormContext();

  const handleNext = async () => {
    const isValid = await trigger([
      "targetAudience", 
      "websitePurpose", 
      "projectDescription",
      "generalStyle",
      "websiteTypeInterest"
    ]);
    
    if (isValid) {
      onNext();
    }
  };

  const websiteTypes = [
    "Corporate Website",
    "E-commerce Store", 
    "Blog/Magazine",
    "Portfolio",
    "Landing Page",
    "Web Application",
    "Mobile App",
    "Social Network",
    "Educational Website",
    "Other"
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium">Project Details</h2>
      
      <div className="space-y-4">
        <FormField
          control={control}
          name="targetAudience"
          rules={{ required: "Target audience is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Audience*</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Who is the website intended for? Describe the demographics, interests, and needs."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="space-y-4">
        <FormField
          control={control}
          name="websiteTypeInterest"
          rules={{ required: "Website type is required" }}
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Website/App Type*</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  {websiteTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={`website-type-${type.toLowerCase().replace(/\s+/g, '-')}`} />
                      <FormLabel 
                        htmlFor={`website-type-${type.toLowerCase().replace(/\s+/g, '-')}`} 
                        className="font-normal cursor-pointer"
                      >
                        {type}
                      </FormLabel>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="space-y-4">
        <FormField
          control={control}
          name="websitePurpose"
          rules={{ required: "Website purpose is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website Purpose*</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What is the main purpose of the website? What should it achieve?"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="space-y-4">
        <FormField
          control={control}
          name="projectDescription"
          rules={{ required: "Project description is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Description*</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide a detailed description of your project. What features do you need? What are your expectations?"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="space-y-4">
        <FormField
          control={control}
          name="generalStyle"
          rules={{ required: "General style preference is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>General Style Preference*</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the general style you're looking for (e.g., minimalist, bold, playful, corporate)."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Back
        </Button>
        <Button type="button" onClick={handleNext}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default UIStepTwo;
