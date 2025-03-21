
import React from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export interface UIStepThreeProps {
  onPrevious: () => void;
  onSubmit: (data: any) => void;
}

const UIStepThree: React.FC<UIStepThreeProps> = ({ onPrevious, onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useFormContext();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-medium">Project Delivery</h2>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="completionDeadline">When do you need this project completed?</Label>
            <Input 
              id="completionDeadline" 
              placeholder="e.g., 2 weeks, by June 1st, etc." 
              {...register("completionDeadline")} 
            />
          </div>
          
          <div>
            <Label>Do you need development services after design completion?</Label>
            <RadioGroup defaultValue="no">
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="yes" id="development-yes" {...register("developmentService")} />
                <Label htmlFor="development-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="development-no" {...register("developmentService")} />
                <Label htmlFor="development-no">No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not-sure" id="development-not-sure" {...register("developmentService")} />
                <Label htmlFor="development-not-sure">Not sure yet</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        {/* Additional requirements */}
        <div>
          <Label htmlFor="additionalRequirements">Additional requirements or notes</Label>
          <Textarea
            id="additionalRequirements"
            placeholder="Any other information that might be helpful..."
            className="h-32"
            {...register("additionalRequirements")}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button type="submit">
          Submit Brief
        </Button>
      </div>
    </form>
  );
};

export default UIStepThree;
