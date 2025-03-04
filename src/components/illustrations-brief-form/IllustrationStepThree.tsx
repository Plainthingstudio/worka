
import React from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface IllustrationStepThreeProps {
  onPrevious: () => void;
  onSubmit: () => void;
}

const DELIVERABLE_OPTIONS = [
  { id: "high_resolution_png", label: "High Resolution PNG" },
  { id: "vector_svg", label: "Vector SVG" },
  { id: "layered_ai_file", label: "Layered AI File" },
  { id: "animation_ready_layers", label: "Animation-Ready Layers" },
  { id: "source_file_editable", label: "Source File (Editable)" },
  { id: "pdf_export", label: "PDF Export" },
  { id: "animated_version_mp4", label: "Animated Version MP4" },
  { id: "animated_version_webm", label: "Animated Version WebM" },
  { id: "social_media_optimized", label: "Social Media Optimized Versions" }
];

const IllustrationStepThree: React.FC<IllustrationStepThreeProps> = ({ onPrevious, onSubmit }) => {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const deliverables = watch("deliverables") || {};

  const handleDeliverableChange = (id: string, checked: boolean) => {
    setValue(`deliverables.${id}`, checked, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Visual Style and Deliverables</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { id: "reference1", label: "Reference 1" },
            { id: "reference2", label: "Reference 2" },
            { id: "reference3", label: "Reference 3" },
            { id: "reference4", label: "Reference 4" },
          ].map((reference) => (
            <div key={reference.id} className="space-y-2">
              <Label htmlFor={reference.id}>{reference.label}</Label>
              <Input
                id={reference.id}
                placeholder="URL to image or design you like"
                {...register(reference.id)}
              />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="generalStyle">General Style Preferences</Label>
          <Textarea
            id="generalStyle"
            placeholder="Describe the general style, mood, and feel you're looking for"
            {...register("generalStyle")}
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="colorPreferences">Color Preferences</Label>
          <Textarea
            id="colorPreferences"
            placeholder="Describe any color preferences or requirements"
            {...register("colorPreferences")}
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="likeDislikeDesign">Likes/Dislikes in Design</Label>
          <Textarea
            id="likeDislikeDesign"
            placeholder="What you like and dislike in illustration design"
            {...register("likeDislikeDesign")}
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Deliverables Needed</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            {DELIVERABLE_OPTIONS.map((option) => (
              <div key={option.id} className="flex items-start space-x-2">
                <Checkbox
                  id={option.id}
                  checked={deliverables[option.id] || false}
                  onCheckedChange={(checked) => 
                    handleDeliverableChange(option.id, checked === true)
                  }
                />
                <Label htmlFor={option.id} className="text-sm font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="completionDeadline">Completion Deadline</Label>
          <Input
            id="completionDeadline"
            type="date"
            placeholder="When do you need this completed?"
            {...register("completionDeadline")}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={onSubmit}>
          Submit Brief
        </Button>
      </div>
    </div>
  );
};

export default IllustrationStepThree;
