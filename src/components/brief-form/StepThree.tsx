
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
      
      <div>
        <h3 className="text-lg font-medium mb-4">Services Required</h3>
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
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Print Media</h3>
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
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Digital Media</h3>
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
      </div>
      
      <div className="flex justify-between pt-6">
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
