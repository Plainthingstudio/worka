
import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  onSubmit: () => void;
}

const StepThree = ({ onPrevious, onSubmit }: StepThreeProps) => {
  const { control, register } = useFormContext();

  const services = [
    { value: "logo_design", label: "Logo Design" },
    { value: "brand_identity", label: "Brand Identity" },
    { value: "branding_guidelines", label: "Branding Guidelines" },
    { value: "business_cards", label: "Business Cards" },
    { value: "letterhead", label: "Letterhead" },
    { value: "envelope", label: "Envelope" },
    { value: "social_media_assets", label: "Social Media Assets" },
    { value: "email_signature", label: "Email Signature" },
    { value: "packaging", label: "Packaging" },
    { value: "merchandise", label: "Merchandise" },
  ];

  const printMedia = [
    { value: "flyers", label: "Flyers" },
    { value: "brochures", label: "Brochures" },
    { value: "posters", label: "Posters" },
    { value: "billboards", label: "Billboards" },
    { value: "business_cards", label: "Business Cards" },
    { value: "catalogs", label: "Catalogs" },
    { value: "direct_mail", label: "Direct Mail" },
    { value: "packaging", label: "Packaging" },
    { value: "menus", label: "Menus" },
    { value: "signage", label: "Signage" },
  ];

  const digitalMedia = [
    { value: "website_banners", label: "Website Banners" },
    { value: "social_media_graphics", label: "Social Media Graphics" },
    { value: "email_marketing", label: "Email Marketing" },
    { value: "online_ads", label: "Online Ads" },
    { value: "digital_brochures", label: "Digital Brochures" },
    { value: "presentations", label: "Presentations" },
    { value: "ebooks", label: "E-books" },
    { value: "infographics", label: "Infographics" },
    { value: "app_graphics", label: "App Graphics" },
    { value: "video_thumbnails", label: "Video Thumbnails" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium">Target Audience & Services</h2>
      
      <div className="space-y-2">
        <FormField
          control={control}
          name="targetAge"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Age Group</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 25-45" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="space-y-2">
        <FormField
          control={control}
          name="targetGender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Gender</FormLabel>
              <FormControl>
                <Input placeholder="e.g., All genders, Women, Men, Non-binary" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="space-y-2">
        <FormField
          control={control}
          name="targetDemography"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Demographics</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Urban professionals, families" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="space-y-2">
        <FormField
          control={control}
          name="targetProfession"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Profession/Income</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Middle-income professionals" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="space-y-2">
        <FormField
          control={control}
          name="targetPersonality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Personality/Interests</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What are the interests, values, and personality traits of your target audience?" 
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <h3 className="text-lg font-medium">Services Required</h3>
      <div className="space-y-4">
        <FormLabel>Select Services</FormLabel>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {services.map((service) => (
            <div key={service.value} className="flex items-center space-x-2">
              <Checkbox 
                id={`service-${service.value}`} 
                {...register(`services.${service.value}`)} 
              />
              <label 
                htmlFor={`service-${service.value}`}
                className="text-sm cursor-pointer"
              >
                {service.label}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <h3 className="text-lg font-medium">Print Media</h3>
      <div className="space-y-4">
        <FormLabel>Select Print Media Items</FormLabel>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {printMedia.map((item) => (
            <div key={item.value} className="flex items-center space-x-2">
              <Checkbox 
                id={`printMedia-${item.value}`} 
                {...register(`printMedia.${item.value}`)} 
              />
              <label 
                htmlFor={`printMedia-${item.value}`}
                className="text-sm cursor-pointer"
              >
                {item.label}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <h3 className="text-lg font-medium">Digital Media</h3>
      <div className="space-y-4">
        <FormLabel>Select Digital Media Items</FormLabel>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {digitalMedia.map((item) => (
            <div key={item.value} className="flex items-center space-x-2">
              <Checkbox 
                id={`digitalMedia-${item.value}`} 
                {...register(`digitalMedia.${item.value}`)} 
              />
              <label 
                htmlFor={`digitalMedia-${item.value}`}
                className="text-sm cursor-pointer"
              >
                {item.label}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
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

export default StepThree;
