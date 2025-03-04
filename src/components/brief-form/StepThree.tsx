
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

interface StepThreeProps {
  onPrevious: () => void;
  onNext: () => void;
}

const StepThree = ({ onPrevious, onNext }: StepThreeProps) => {
  const { control } = useFormContext();

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-medium">Target Audience & Brand Information</h2>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Target Audience</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <FormField
            control={control}
            name="targetAge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age Range</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 18-35" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="targetGender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <FormControl>
                  <Input placeholder="All genders" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <FormField
            control={control}
            name="targetDemography"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Demography</FormLabel>
                <FormControl>
                  <Input placeholder="Enter demography" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="targetProfession"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profession</FormLabel>
                <FormControl>
                  <Input placeholder="Enter profession" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={control}
          name="targetPersonality"
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel>Personality</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe target personality" 
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Brand Information</h3>
        
        <FormField
          control={control}
          name="productsServices"
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel>Products/Services</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your products or services" 
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="featuresAndBenefits"
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel>Features and Benefits</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What are the brand's features and benefits for users/customers?" 
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="marketCategory"
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel>Market Category</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Technology, Fashion, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <FormField
            control={control}
            name="competitor1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Competitor 1</FormLabel>
                <FormControl>
                  <Input placeholder="Competitor 1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="competitor2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Competitor 2</FormLabel>
                <FormControl>
                  <Input placeholder="Competitor 2" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <FormField
            control={control}
            name="competitor3"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Competitor 3</FormLabel>
                <FormControl>
                  <Input placeholder="Competitor 3" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="competitor4"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Competitor 4</FormLabel>
                <FormControl>
                  <Input placeholder="Competitor 4" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={control}
          name="brandPositioning"
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel>Brand Positioning</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What is your brand positioning?" 
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="barrierToEntry"
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel>Barrier to Entry</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What is the barrier to entry for the brand?" 
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="specificImagery"
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel>Specific Imagery</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Do you have any specific imagery in mind for the logo?" 
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default StepThree;
