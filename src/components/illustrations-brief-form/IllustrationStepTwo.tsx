
import React from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface IllustrationStepTwoProps {
  onNext: () => void;
  onPrevious: () => void;
}

const IllustrationStepTwo: React.FC<IllustrationStepTwoProps> = ({ onNext, onPrevious }) => {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const illustrationsCount = watch("illustrationsCount") || 1;
  const illustrationDetails = watch("illustrationDetails") || [""];
  const hasBrandGuidelines = watch("hasBrandGuidelines") || "No";

  const handleIllustrationCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value) || 1;
    setValue("illustrationsCount", count);
    
    // Update the illustrationDetails array to match the new count
    const details = [...illustrationDetails];
    if (count > details.length) {
      // Add empty strings to the array
      for (let i = details.length; i < count; i++) {
        details.push("");
      }
    } else if (count < details.length) {
      // Remove elements from the array
      details.splice(count);
    }
    setValue("illustrationDetails", details);
  };

  const updateIllustrationDetail = (index: number, value: string) => {
    const details = [...illustrationDetails];
    details[index] = value;
    setValue("illustrationDetails", details);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Illustration Requirements</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="illustrationsFor">What Are These Illustrations For? <span className="text-red-500">*</span></Label>
          <Textarea
            id="illustrationsFor"
            placeholder="Where will these illustrations be used? (e.g., website, app, social media, etc.)"
            {...register("illustrationsFor", { required: "This field is required" })}
            className={`min-h-[80px] ${errors.illustrationsFor ? "border-red-500" : ""}`}
          />
          {errors.illustrationsFor && (
            <p className="text-red-500 text-sm">{String(errors.illustrationsFor.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="illustrationsStyle">Illustration Style <span className="text-red-500">*</span></Label>
          <Textarea
            id="illustrationsStyle"
            placeholder="Describe the style you're looking for (e.g., minimalist, cartoon, realistic, isometric, etc.)"
            {...register("illustrationsStyle", { required: "Style description is required" })}
            className={`min-h-[80px] ${errors.illustrationsStyle ? "border-red-500" : ""}`}
          />
          {errors.illustrationsStyle && (
            <p className="text-red-500 text-sm">{String(errors.illustrationsStyle.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetAudience">Target Audience <span className="text-red-500">*</span></Label>
          <Textarea
            id="targetAudience"
            placeholder="Describe your target audience (age, interests, demographics, etc.)"
            {...register("targetAudience", { required: "Target audience is required" })}
            className={`min-h-[80px] ${errors.targetAudience ? "border-red-500" : ""}`}
          />
          {errors.targetAudience && (
            <p className="text-red-500 text-sm">{String(errors.targetAudience.message)}</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { id: "competitor1", label: "Competitor 1" },
              { id: "competitor2", label: "Competitor 2" },
              { id: "competitor3", label: "Competitor 3" },
              { id: "competitor4", label: "Competitor 4" },
            ].map((competitor) => (
              <div key={competitor.id} className="space-y-2">
                <Label htmlFor={competitor.id}>{competitor.label}</Label>
                <Input
                  id={competitor.id}
                  placeholder="Website URL or company name"
                  {...register(competitor.id)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Brand Guidelines</Label>
          <RadioGroup 
            value={hasBrandGuidelines}
            onValueChange={(value) => {
              setValue("hasBrandGuidelines", value);
              if (value === "No") {
                setValue("brandGuidelines", "");
              }
            }}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Yes" id="guidelines-yes" />
              <Label htmlFor="guidelines-yes" className="font-normal cursor-pointer">
                Yes, I have brand guidelines
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No" id="guidelines-no" />
              <Label htmlFor="guidelines-no" className="font-normal cursor-pointer">
                No, I don't have brand guidelines
              </Label>
            </div>
          </RadioGroup>
        </div>

        {hasBrandGuidelines === "Yes" && (
          <div className="space-y-2 pl-6">
            <Label htmlFor="brandGuidelines">Brand Guidelines Details</Label>
            <Textarea
              id="brandGuidelines"
              placeholder="Please provide details or a link to access your brand guidelines"
              {...register("brandGuidelines")}
              className="min-h-[80px]"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="illustrationsCount">Number of Illustrations <span className="text-red-500">*</span></Label>
          <Input
            id="illustrationsCount"
            type="number"
            min="1"
            {...register("illustrationsCount", { 
              required: "Number of illustrations is required",
              min: { value: 1, message: "Must be at least 1" }
            })}
            onChange={handleIllustrationCountChange}
            className={errors.illustrationsCount ? "border-red-500" : ""}
          />
          {errors.illustrationsCount && (
            <p className="text-red-500 text-sm">{String(errors.illustrationsCount.message)}</p>
          )}
        </div>

        {Array.from({ length: illustrationsCount }).map((_, index) => (
          <div key={index} className="space-y-2 border p-4 rounded-md">
            <Label htmlFor={`illustrationDetail-${index}`}>Illustration {index + 1} Details</Label>
            <Textarea
              id={`illustrationDetail-${index}`}
              placeholder="Describe what this illustration should show"
              value={illustrationDetails[index] || ""}
              onChange={(e) => updateIllustrationDetail(index, e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default IllustrationStepTwo;
