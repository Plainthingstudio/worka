
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
  tone?: string[] | null; // Made optional since we're not using it anymore
}

const LogoPreferencesSection: React.FC<LogoPreferencesSectionProps> = ({
  logoFeelings,
  logoType
}) => {
  console.log("Logo preferences received in section:", logoFeelings);
  
  // Add effect to log whenever logoFeelings changes
  useEffect(() => {
    console.log("LogoPreferencesSection updated with logoFeelings:", logoFeelings);
  }, [logoFeelings]);
  
  return (
    <>
      {/* Logo Preferences section */}
      <div>
        <h4 className="font-medium">Logo Preferences</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          {logoFeelings && (
            <>
              <div>
                <h5 className="text-sm font-medium">Feminine vs Masculine</h5>
                <p>{logoFeelings.gender || "Not provided"}</p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium">Economical vs Luxury</h5>
                <p>{logoFeelings.pricing || "Not provided"}</p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium">Modern vs Classic</h5>
                <p>{logoFeelings.era || "Not provided"}</p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium">Serious vs Playful</h5>
                <p>{logoFeelings.tone || "Not provided"}</p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium">Simple vs Complex</h5>
                <p>{logoFeelings.complexity || "Not provided"}</p>
              </div>
            </>
          )}
          
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
