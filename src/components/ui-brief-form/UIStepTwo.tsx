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

interface UIStepTwoProps {
  onNext: () => void;
  onPrevious: () => void;
}

const UIStepTwo = ({ onNext, onPrevious }: UIStepTwoProps) => {
  const { control, trigger, watch } = useFormContext();
  
  const existingBrandAssets = watch("existingBrandAssets");
  const hasWireframe = watch("hasWireframe");

  const handleNext = async () => {
    const fields = [
      "aboutCompany", 
      "targetAudience", 
      "competitor1",
      "industry",
      "generalStyle",
      "colorPreferences",
      "reference1",
      "existingBrandAssets",
      "hasWireframe"
    ];

    const isValid = await trigger(fields);
    
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      {/* Company & Target Audience */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Company & Target Audience</h2>
        
        <FormField
          control={control}
          name="aboutCompany"
          rules={{ required: "About company is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>About Company*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell us about your company, its mission, and values"
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
          name="targetAudience"
          rules={{ required: "Target audience is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Audience*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your target audience - demographics, interests, needs"
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel className="text-base font-medium mb-4 block">Competitors</FormLabel>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <FormField
                key={i}
                control={control}
                name={`competitor${i}`}
                rules={i === 1 ? { required: "At least one competitor is required" } : {}}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Competitor {i}{i === 1 ? "*" : ""}</FormLabel>
                    <FormControl>
                      <Input placeholder={`https://competitor${i}.com`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        <FormField
          control={control}
          name="industry"
          rules={{ required: "Industry is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry*</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Technology, Healthcare, Finance" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Design Preferences */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Design Preferences</h2>
        
        <FormField
          control={control}
          name="generalStyle"
          rules={{ required: "General style is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>General Style*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your preferred style (e.g., minimalist, modern, bold, corporate)"
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
          name="colorPreferences"
          rules={{ required: "Color preferences are required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color Preferences*</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Blue and white, Warm colors, Brand colors" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel className="text-base font-medium mb-4 block">References</FormLabel>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <FormField
                key={i}
                control={control}
                name={`reference${i}`}
                rules={i === 1 ? { required: "At least one reference is required" } : {}}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference {i}{i === 1 ? "*" : ""}</FormLabel>
                    <FormControl>
                      <Input placeholder={`https://reference${i}.com`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Brand & Design */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Brand & Design</h2>
        
        <FormField
          control={control}
          name="existingBrandAssets"
          rules={{ required: "Please specify if you have existing brand assets" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Existing Brand Assets*</FormLabel>
              <FormControl>
                <RadioGroup 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="brand-assets-yes" />
                    <FormLabel htmlFor="brand-assets-yes" className="font-normal cursor-pointer">
                      Yes
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="brand-assets-no" />
                    <FormLabel htmlFor="brand-assets-no" className="font-normal cursor-pointer">
                      No
                    </FormLabel>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {existingBrandAssets === "yes" && (
          <FormField
            control={control}
            name="brandAssetsDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand Assets Details</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe your existing brand assets (logo, colors, fonts, etc.)"
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={control}
          name="hasWireframe"
          rules={{ required: "Please specify if you have wireframes" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wireframe*</FormLabel>
              <FormControl>
                <RadioGroup 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="wireframe-yes" />
                    <FormLabel htmlFor="wireframe-yes" className="font-normal cursor-pointer">
                      Yes
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="wireframe-no" />
                    <FormLabel htmlFor="wireframe-no" className="font-normal cursor-pointer">
                      No
                    </FormLabel>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {hasWireframe === "yes" && (
          <FormField
            control={control}
            name="wireframeDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wireframe Details</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe your wireframes or provide links to view them"
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
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