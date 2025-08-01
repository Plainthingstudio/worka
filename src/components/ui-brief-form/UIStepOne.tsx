import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface UIStepOneProps {
  onNext: () => void;
}

const UIStepOne = ({ onNext }: UIStepOneProps) => {
  const { control, trigger } = useFormContext();

  const handleNext = async () => {
    const isValid = await trigger([
      "name", 
      "email", 
      "companyName", 
      "projectDescription",
      "completionDeadline",
      "projectType",
      "projectSize",
      "websiteType",
      "currentWebsite",
      "websitePurpose"
    ]);
    
    if (isValid) {
      onNext();
    }
  };

  const projectTypes = [
    "Redesign website",
    "New website", 
    "Landing page",
    "Web app",
    "Mobile app",
    "E-commerce",
    "Dashboard",
    "Design system"
  ];

  const projectSizes = [
    "Small (1-5 screen/page)",
    "Medium (6-15 screen/page)",
    "Large (15-30 screen/page)",
    "Enterprise (30+ screen)"
  ];

  const websiteTypes = [
    "Corporate Website",
    "E-commerce Store",
    "Blog/Magazine",
    "Portfolio",
    "Landing Page",
    "Web Application",
    "Mobile App",
    "Educational Website",
    "Crypto",
    "Web3",
    "Other"
  ];

  return (
    <div className="space-y-8">
      {/* Client Information */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Client Information</h2>
        
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={control}
            name="name"
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="email"
            rules={{ required: "Email is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="companyName"
            rules={{ required: "Company name is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Project Information */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Project Information</h2>
        
        <FormField
          control={control}
          name="projectDescription"
          rules={{ required: "Project description is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Description*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your project in detail"
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="completionDeadline"
          rules={{ required: "Deadline is required" }}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Deadline Project*</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date?.toISOString())}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={control}
            name="projectType"
            rules={{ required: "Project type is required" }}
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
          
          <FormField
            control={control}
            name="projectSize"
            rules={{ required: "Project size is required" }}
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

          <FormField
            control={control}
            name="websiteType"
            rules={{ required: "Website type is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website Type*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select website type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {websiteTypes.map((type) => (
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

        <FormField
          control={control}
          name="currentWebsite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Website</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="websitePurpose"
          rules={{ required: "Website purpose is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website Purpose*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What is the main purpose of your website?"
                  className="min-h-[120px]"
                  {...field} 
                />
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

export default UIStepOne;