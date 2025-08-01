import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
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

interface UIStepThreeProps {
  onPrevious: () => void;
  onSubmit: () => void;
}

const UIStepThree = ({ onPrevious, onSubmit }: UIStepThreeProps) => {
  const { control, register, watch, setValue } = useFormContext();
  const pageCount = watch("pageCount") || 1;

  const handleIncreasePages = () => {
    const currentCount = parseInt(pageCount);
    const newCount = currentCount + 1;
    setValue("pageCount", newCount);
    
    // Initialize new page details if needed
    const currentPageDetails = watch("pageDetails") || [];
    if (currentPageDetails.length < newCount) {
      const newPageDetails = [...currentPageDetails];
      for (let i = currentPageDetails.length; i < newCount; i++) {
        newPageDetails.push({ name: "", description: "" });
      }
      setValue("pageDetails", newPageDetails);
    }
  };

  const handleDecreasePages = () => {
    const currentCount = parseInt(pageCount);
    if (currentCount > 1) {
      const newCount = currentCount - 1;
      setValue("pageCount", newCount);
      
      // Remove extra page details
      const currentPageDetails = watch("pageDetails") || [];
      if (currentPageDetails.length > newCount) {
        setValue("pageDetails", currentPageDetails.slice(0, newCount));
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Information */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Page Information</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <FormLabel>Number of Pages*</FormLabel>
            <div className="flex items-center space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleDecreasePages}
                disabled={parseInt(pageCount) <= 1}
              >
                -
              </Button>
              <span className="w-12 text-center font-medium">{pageCount}</span>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleIncreasePages}
              >
                +
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {Array.from({ length: parseInt(pageCount) }).map((_, index) => (
              <div key={index} className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-medium">Page {index + 1}</h3>
                
                <FormField
                  control={control}
                  name={`pageDetails.${index}.name`}
                  rules={{ required: `Page ${index + 1} name is required` }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page Name*</FormLabel>
                      <FormControl>
                        <Input placeholder={`e.g., Home, About, Contact`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name={`pageDetails.${index}.description`}
                  rules={{ required: `Page ${index + 1} description is required` }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page Description*</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What should this page include?" 
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>

          <FormField
            control={control}
            name="websiteContent"
            rules={{ required: "Please specify your content status" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website Content*</FormLabel>
                <FormControl>
                  <RadioGroup 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="I have content ready" id="content-ready" />
                      <FormLabel htmlFor="content-ready" className="font-normal cursor-pointer">
                        I have content ready
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="I need help with content" id="content-help" />
                      <FormLabel htmlFor="content-help" className="font-normal cursor-pointer">
                        I need help with content
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="I'll provide content later" id="content-later" />
                      <FormLabel htmlFor="content-later" className="font-normal cursor-pointer">
                        I'll provide content later
                      </FormLabel>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="developmentService"
            rules={{ required: "Please specify your development needs" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Development Service*</FormLabel>
                <FormControl>
                  <RadioGroup 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="I need design only" id="design-only" />
                      <FormLabel htmlFor="design-only" className="font-normal cursor-pointer">
                        I need design only
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="I need design and development" id="design-dev" />
                      <FormLabel htmlFor="design-dev" className="font-normal cursor-pointer">
                        I need design and development
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="I'm not sure yet" id="not-sure" />
                      <FormLabel htmlFor="not-sure" className="font-normal cursor-pointer">
                        I'm not sure yet
                      </FormLabel>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Back
        </Button>
        <Button type="button" onClick={onSubmit}>
          Submit Brief
        </Button>
      </div>
    </div>
  );
};

export default UIStepThree;