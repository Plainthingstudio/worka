
import React from "react";

interface ServicesMediaSectionProps {
  services: string[] | null;
  printMedia: string[] | null;
  digitalMedia: string[] | null;
}

const ServicesMediaSection: React.FC<ServicesMediaSectionProps> = ({
  services,
  printMedia,
  digitalMedia
}) => {
  return (
    <>
      {/* Services section */}
      <div>
        <h4 className="font-medium">Services Required</h4>
        <div className="space-y-1 mt-1">
          {Array.isArray(services) && services.length > 0 ? (
            services.map((service: string, index: number) => (
              <p key={index}>• {service}</p>
            ))
          ) : (
            <p>Not provided</p>
          )}
        </div>
      </div>
      
      {/* Print Media section */}
      <div>
        <h4 className="font-medium">Print Media</h4>
        <div className="space-y-1 mt-1">
          {Array.isArray(printMedia) && printMedia.length > 0 ? (
            printMedia.map((item: string, index: number) => (
              <p key={index}>• {item}</p>
            ))
          ) : (
            <p>Not provided</p>
          )}
        </div>
      </div>
      
      {/* Digital Media section */}
      <div>
        <h4 className="font-medium">Digital Media</h4>
        <div className="space-y-1 mt-1">
          {Array.isArray(digitalMedia) && digitalMedia.length > 0 ? (
            digitalMedia.map((item: string, index: number) => (
              <p key={index}>• {item}</p>
            ))
          ) : (
            <p>Not provided</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ServicesMediaSection;
