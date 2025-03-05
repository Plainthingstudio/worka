
import React from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface StepFourProps {
  onPrevious: () => void;
  onSubmit: () => void;
}

const StepFour = ({ onPrevious, onSubmit }: StepFourProps) => {
  const { register, watch } = useFormContext();
  const watchedServices = watch("services") || {};
  const watchedPrintMedia = watch("printMedia") || {};
  const watchedDigitalMedia = watch("digitalMedia") || {};

  // For debugging purposes
  console.log("Services in form:", watchedServices);
  console.log("Print Media in form:", watchedPrintMedia);
  console.log("Digital Media in form:", watchedDigitalMedia);

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
      <div>
        <h2 className="text-2xl font-medium mb-6">Services Required</h2>
        
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-medium">Select Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {services.map((service) => (
              <div key={service.value} className="flex items-center space-x-2">
                <Checkbox 
                  id={`service-${service.value}`} 
                  {...register(`services.${service.value}`)} 
                />
                <label 
                  htmlFor={`service-${service.value}`}
                  className="text-base cursor-pointer"
                >
                  {service.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-medium mb-6">Print Media</h2>
        
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-medium">Select Print Media Items</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {printMedia.map((item) => (
              <div key={item.value} className="flex items-center space-x-2">
                <Checkbox 
                  id={`printMedia-${item.value}`} 
                  {...register(`printMedia.${item.value}`)} 
                />
                <label 
                  htmlFor={`printMedia-${item.value}`}
                  className="text-base cursor-pointer"
                >
                  {item.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-medium mb-6">Digital Media</h2>
        
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-medium">Select Digital Media Items</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {digitalMedia.map((item) => (
              <div key={item.value} className="flex items-center space-x-2">
                <Checkbox 
                  id={`digitalMedia-${item.value}`} 
                  {...register(`digitalMedia.${item.value}`)} 
                />
                <label 
                  htmlFor={`digitalMedia-${item.value}`}
                  className="text-base cursor-pointer"
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

export default StepFour;
