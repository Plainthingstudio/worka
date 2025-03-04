
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

interface UIStepThreeProps {
  onPrevious: () => void;
  onSubmit: () => void;
}

const UIStepThree = ({ onPrevious, onSubmit }: UIStepThreeProps) => {
  const { control, register, watch, setValue } = useFormContext();
  const pageCount = watch("pageCount") || 1;

  const handleIncreasePages = () => {
    setValue("pageCount", parseInt(pageCount) + 1);
  };

  const handleDecreasePages = () => {
    if (parseInt(pageCount) > 1) {
      setValue("pageCount", parseInt(pageCount) - 1);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium">Project Details</h2>
      
      <div className="space-y-2">
        <FormLabel>Number of Pages/Screens</FormLabel>
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
          <span className="w-8 text-center">{pageCount}</span>
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
      
      {Array.from({ length: parseInt(pageCount) }).map((_, index) => (
        <div key={index} className="space-y-2 p-4 border rounded-md">
          <h3 className="font-medium">Page/Screen {index + 1}</h3>
          <FormField
            control={control}
            name={`pageDetails[${index}].name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Page Name</FormLabel>
                <FormControl>
                  <Input placeholder={`e.g., Home, About, Contact`} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`pageDetails[${index}].description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Page Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="What should this page/screen include?" 
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
      
      <div className="space-y-2">
        <FormField
          control={control}
          name="websiteContent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website Content</FormLabel>
              <FormControl>
                <RadioGroup 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
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
      </div>
      
      <div className="space-y-2">
        <FormField
          control={control}
          name="developmentService"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Development Service</FormLabel>
              <FormControl>
                <RadioGroup 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Design only" id="design-only" />
                    <FormLabel htmlFor="design-only" className="font-normal cursor-pointer">
                      I need design only
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Design and development" id="design-dev" />
                    <FormLabel htmlFor="design-dev" className="font-normal cursor-pointer">
                      I need design and development
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Not sure" id="not-sure" />
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
      
      <div className="space-y-2">
        <FormField
          control={control}
          name="completionDeadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Completion Deadline</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
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
        <Button type="button" onClick={onSubmit}>
          Submit Brief
        </Button>
      </div>
    </div>
  );
};

export default UIStepThree;
