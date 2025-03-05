
import React from "react";

interface LogoPreferencesSectionProps {
  logoFeelings: {
    gender?: string;
    pricing?: string;
    era?: string;
    tone?: string;
    complexity?: string;
  } | null;
  logoType: string | null;
  tone: string[] | null;
}

const LogoPreferencesSection: React.FC<LogoPreferencesSectionProps> = ({
  logoFeelings,
  logoType,
  tone
}) => {
  return (
    <>
      {/* Logo Preferences section */}
      <div>
        <h4 className="font-medium">Logo Preferences</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          {logoFeelings && (
            <>
              <div>
                <h5 className="text-sm font-medium">Gender</h5>
                <p>{logoFeelings.gender || "Not provided"}</p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium">Price Point</h5>
                <p>{logoFeelings.pricing || "Not provided"}</p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium">Era</h5>
                <p>{logoFeelings.era || "Not provided"}</p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium">Tone</h5>
                <p>{logoFeelings.tone || "Not provided"}</p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium">Complexity</h5>
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
      
      {/* Logo Tone section */}
      {Array.isArray(tone) && tone.length > 0 && (
        <div>
          <h4 className="font-medium">Logo Tone</h4>
          <p className="mt-1">{tone.join(", ")}</p>
        </div>
      )}
    </>
  );
};

export default LogoPreferencesSection;
