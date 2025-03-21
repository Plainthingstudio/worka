
import React, { useEffect } from "react";

interface LogoPreferencesSectionProps {
  logoFeelings: {
    gender?: string;
    pricing?: string;
    era?: string;
    tone?: string;
    complexity?: string;
  } | null;
  logoType: string | null;
}

const LogoPreferencesSection: React.FC<LogoPreferencesSectionProps> = ({
  logoFeelings,
  logoType
}) => {
  // Add enhanced logging to help debug the component
  useEffect(() => {
    console.log("LogoPreferencesSection rendered with:", {
      logoFeelings,
      logoType,
      logoFeelingsType: typeof logoFeelings
    });
  }, [logoFeelings, logoType]);
  
  // Helper to safely get logo feeling values
  const getLogoFeeling = (key: string, defaultValue = "Not provided") => {
    if (!logoFeelings) return defaultValue;
    
    // Access the property directly since we've already handled JSON parsing in the parent component
    return logoFeelings[key as keyof typeof logoFeelings] || defaultValue;
  };
  
  return (
    <>
      {/* Logo Preferences section */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div>
            <h5 className="text-sm font-medium">Feminine vs Masculine</h5>
            <p>{getLogoFeeling("gender")}</p>
          </div>
          
          <div>
            <h5 className="text-sm font-medium">Economical vs Luxury</h5>
            <p>{getLogoFeeling("pricing")}</p>
          </div>
          
          <div>
            <h5 className="text-sm font-medium">Modern vs Classic</h5>
            <p>{getLogoFeeling("era")}</p>
          </div>
          
          <div>
            <h5 className="text-sm font-medium">Serious vs Playful</h5>
            <p>{getLogoFeeling("tone")}</p>
          </div>
          
          <div>
            <h5 className="text-sm font-medium">Simple vs Complex</h5>
            <p>{getLogoFeeling("complexity")}</p>
          </div>
          
          <div>
            <h5 className="text-sm font-medium">Logo Type</h5>
            <p>{logoType || "Not provided"}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoPreferencesSection;
