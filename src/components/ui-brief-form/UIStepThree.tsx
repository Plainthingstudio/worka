import React from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
  const { control } = useFormContext();

  return (
    <div className="space-y-8">
      {/* Website Content and Development Service */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Final Details</h2>
        
        <div className="space-y-4">

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