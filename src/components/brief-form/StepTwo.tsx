
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

interface StepTwoProps {
  onNext: () => void;
  onPrevious: () => void;
}

const StepTwo = ({ onNext, onPrevious }: StepTwoProps) => {
  const { control, trigger } = useFormContext();

  const handleNext = async () => {
    const isValid = await trigger([
      "logoFeelings.style", 
      "logoFeelings.pricing", 
      "logoFeelings.era",
      "logoFeelings.tone",
      "logoFeelings.complexity",
      "logoType"
    ]);
    
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium">Logo Design Preferences</h2>
      
      <div className="space-y-4">
        <FormField
          control={control}
          name="logoFeelings.style"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo Style*</FormLabel>
              <FormControl>
                <RadioGroup 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Modern" id="style-modern" />
                    <FormLabel htmlFor="style-modern" className="font-normal cursor-pointer">
                      Modern
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Classic" id="style-classic" />
                    <FormLabel htmlFor="style-classic" className="font-normal cursor-pointer">
                      Classic
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Minimalist" id="style-minimalist" />
                    <FormLabel htmlFor="style-minimalist" className="font-normal cursor-pointer">
                      Minimalist
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Bold" id="style-bold" />
                    <FormLabel htmlFor="style-bold" className="font-normal cursor-pointer">
                      Bold
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Playful" id="style-playful" />
                    <FormLabel htmlFor="style-playful" className="font-normal cursor-pointer">
                      Playful
                    </FormLabel>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="space-y-4">
        <FormField
          control={control}
          name="logoFeelings.pricing"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pricing Tier*</FormLabel>
              <FormControl>
                <RadioGroup 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Budget" id="pricing-budget" />
                    <FormLabel htmlFor="pricing-budget" className="font-normal cursor-pointer">
                      Budget
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Mid-range" id="pricing-midrange" />
                    <FormLabel htmlFor="pricing-midrange" className="font-normal cursor-pointer">
                      Mid-range
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Premium" id="pricing-premium" />
                    <FormLabel htmlFor="pricing-premium" className="font-normal cursor-pointer">
                      Premium
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Luxury" id="pricing-luxury" />
                    <FormLabel htmlFor="pricing-luxury" className="font-normal cursor-pointer">
                      Luxury
                    </FormLabel>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="space-y-4">
        <FormField
          control={control}
          name="logoFeelings.era"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Era/Time Period*</FormLabel>
              <FormControl>
                <RadioGroup 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Contemporary" id="era-contemporary" />
                    <FormLabel htmlFor="era-contemporary" className="font-normal cursor-pointer">
                      Contemporary
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Retro" id="era-retro" />
                    <FormLabel htmlFor="era-retro" className="font-normal cursor-pointer">
                      Retro
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Vintage" id="era-vintage" />
                    <FormLabel htmlFor="era-vintage" className="font-normal cursor-pointer">
                      Vintage
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Futuristic" id="era-futuristic" />
                    <FormLabel htmlFor="era-futuristic" className="font-normal cursor-pointer">
                      Futuristic
                    </FormLabel>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="space-y-4">
        <FormField
          control={control}
          name="logoFeelings.tone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tone*</FormLabel>
              <FormControl>
                <RadioGroup 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Professional" id="tone-professional" />
                    <FormLabel htmlFor="tone-professional" className="font-normal cursor-pointer">
                      Professional
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Friendly" id="tone-friendly" />
                    <FormLabel htmlFor="tone-friendly" className="font-normal cursor-pointer">
                      Friendly
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Fun" id="tone-fun" />
                    <FormLabel htmlFor="tone-fun" className="font-normal cursor-pointer">
                      Fun
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Serious" id="tone-serious" />
                    <FormLabel htmlFor="tone-serious" className="font-normal cursor-pointer">
                      Serious
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Innovative" id="tone-innovative" />
                    <FormLabel htmlFor="tone-innovative" className="font-normal cursor-pointer">
                      Innovative
                    </FormLabel>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="space-y-4">
        <FormField
          control={control}
          name="logoFeelings.complexity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Complexity*</FormLabel>
              <FormControl>
                <RadioGroup 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Simple" id="complexity-simple" />
                    <FormLabel htmlFor="complexity-simple" className="font-normal cursor-pointer">
                      Simple
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Moderately complex" id="complexity-moderate" />
                    <FormLabel htmlFor="complexity-moderate" className="font-normal cursor-pointer">
                      Moderately complex
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Complex" id="complexity-complex" />
                    <FormLabel htmlFor="complexity-complex" className="font-normal cursor-pointer">
                      Complex
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Very detailed" id="complexity-detailed" />
                    <FormLabel htmlFor="complexity-detailed" className="font-normal cursor-pointer">
                      Very detailed
                    </FormLabel>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="space-y-4">
        <FormField
          control={control}
          name="logoType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo Type*</FormLabel>
              <FormControl>
                <RadioGroup 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Wordmark" id="type-wordmark" />
                    <FormLabel htmlFor="type-wordmark" className="font-normal cursor-pointer">
                      Wordmark (text only)
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Lettermark" id="type-lettermark" />
                    <FormLabel htmlFor="type-lettermark" className="font-normal cursor-pointer">
                      Lettermark (initials)
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Symbol" id="type-symbol" />
                    <FormLabel htmlFor="type-symbol" className="font-normal cursor-pointer">
                      Symbol (icon only)
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Combination" id="type-combination" />
                    <FormLabel htmlFor="type-combination" className="font-normal cursor-pointer">
                      Combination (text + symbol)
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Emblem" id="type-emblem" />
                    <FormLabel htmlFor="type-emblem" className="font-normal cursor-pointer">
                      Emblem (text inside symbol)
                    </FormLabel>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <h3 className="text-lg font-medium">Design References</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Share links to logos or designs you like
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

export default StepTwo;
