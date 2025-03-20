
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";

export interface UIStepThreeProps {
  onPrevious: () => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
}

const UIStepThree = ({ onPrevious, onSubmit, isSubmitting }: UIStepThreeProps) => {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium">Design Details & Deliverables</h2>
      
      <div className="space-y-2">
        <FormField
          control={control}
          name="generalStyle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>General Style Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the overall style you're looking for"
                  className="min-h-[100px]"
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
          name="colorPreferences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color Preferences</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your color preferences"
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
          name="fontPreferences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Font Preferences</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your font preferences"
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
          name="existingBrandAssets"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Existing Brand Assets</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe any existing brand assets you have"
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
          name="hasBrandGuidelines"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Do you have brand guidelines?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Yes" />
                    </FormControl>
                    <FormLabel className="font-normal">Yes</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="No" />
                    </FormControl>
                    <FormLabel className="font-normal">No</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="brandGuidelinesDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>If yes, please provide details</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Provide details about your brand guidelines"
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
          name="hasWireframe"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Do you have wireframes or mockups?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Yes" />
                    </FormControl>
                    <FormLabel className="font-normal">Yes</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="No" />
                    </FormControl>
                    <FormLabel className="font-normal">No</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="wireframeDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>If yes, please provide details</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Provide details about your wireframes"
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
          name="pageCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Pages/Screens</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="e.g., 5" 
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
          name="completionDeadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Completion Deadline</FormLabel>
              <FormControl>
                <Input 
                  placeholder="When do you need this delivered?" 
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
          name="developmentService"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Do you need development services?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Not sure">Not sure yet</SelectItem>
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
          name="websiteContent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Do you have your website content ready?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Partially">Partially</SelectItem>
                  <SelectItem value="Need help">Need help with content</SelectItem>
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
          name="stylePreferences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Style Preferences</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional style preferences we should know about?"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
        >
          Previous
        </Button>
        <Button 
          type="button" 
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Brief"
          )}
        </Button>
      </div>
    </div>
  );
};

export default UIStepThree;
