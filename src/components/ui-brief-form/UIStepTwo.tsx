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

interface UIStepTwoProps {
  onNext: () => void;
  onPrevious: () => void;
}

const UIStepTwo = ({ onNext, onPrevious }: UIStepTwoProps) => {
  const { control, trigger } = useFormContext();

  const handleNext = async () => {
    const isValid = await trigger([
      "targetAudience", 
      "websitePurpose", 
      "projectDescription",
      "generalStyle"
    ]);
    
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium">Design Preferences</h2>
      
      <div className="space-y-2">
        <FormField
          control={control}
          name="targetAudience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Audience*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your target audience (age, demographics, interests, etc.)" 
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
          name="websitePurpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website/App Purpose*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What is the main purpose of your website/app? What do you want visitors to do?" 
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
          name="projectDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Description*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your project in detail, including its goals and objectives" 
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
        <h3 className="text-lg font-medium">Design References</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Share links to websites or apps whose design you like
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <FormField
                control={control}
                name={`reference${i}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference {i}</FormLabel>
                    <FormControl>
                      <Input placeholder={`https://example${i}.com`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <FormField
          control={control}
          name="generalStyle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>General Style Preferences*</FormLabel>
              <FormControl>
                <RadioGroup 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Minimalist" id="minimalist" />
                    <FormLabel htmlFor="minimalist" className="font-normal cursor-pointer">
                      Minimalist/Clean
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Corporate" id="corporate" />
                    <FormLabel htmlFor="corporate" className="font-normal cursor-pointer">
                      Corporate/Professional
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Creative" id="creative" />
                    <FormLabel htmlFor="creative" className="font-normal cursor-pointer">
                      Creative/Artistic
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Modern" id="modern" />
                    <FormLabel htmlFor="modern" className="font-normal cursor-pointer">
                      Modern/Trendy
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Playful" id="playful" />
                    <FormLabel htmlFor="playful" className="font-normal cursor-pointer">
                      Playful/Fun
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Luxury" id="luxury" />
                    <FormLabel htmlFor="luxury" className="font-normal cursor-pointer">
                      Luxury/Premium
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
          name="colorPreferences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color Preferences</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any specific colors you want to use or avoid?" 
                  className="min-h-[80px]"
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
              <FormLabel>Font/Typography Preferences</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any specific fonts or typography styles you prefer?" 
                  className="min-h-[80px]"
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
                  placeholder="Describe any existing brand assets you have (logo, colors, fonts, etc.)" 
                  className="min-h-[80px]"
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
          name="hasBrandGuidelines"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand Guidelines</FormLabel>
              <FormControl>
                <RadioGroup 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="brand-yes" />
                    <FormLabel htmlFor="brand-yes" className="font-normal cursor-pointer">
                      Yes, I have brand guidelines
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="brand-no" />
                    <FormLabel htmlFor="brand-no" className="font-normal cursor-pointer">
                      No, I don't have brand guidelines
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
          name="brandGuidelinesDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand Guidelines Details</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="If you have brand guidelines, please provide details or a link to access them" 
                  className="min-h-[80px]"
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
          name="hasWireframe"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wireframes/Mockups</FormLabel>
              <FormControl>
                <RadioGroup 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="wireframe-yes" />
                    <FormLabel htmlFor="wireframe-yes" className="font-normal cursor-pointer">
                      Yes, I have wireframes/mockups
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="wireframe-no" />
                    <FormLabel htmlFor="wireframe-no" className="font-normal cursor-pointer">
                      No, I don't have wireframes/mockups
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
          name="wireframeDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wireframe/Mockup Details</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="If you have wireframes or mockups, please provide details or a link to access them" 
                  className="min-h-[80px]"
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
          name="stylePreferences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Style Preferences</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe any specific style preferences or design elements you'd like to include" 
                  className="min-h-[80px]"
                  {...field} 
                />
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
        <Button type="button" onClick={handleNext}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default UIStepTwo;
