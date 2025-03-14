
import React from "react";

interface TargetAudienceSectionProps {
  targetAge: string | null;
  targetGender: string | null;
  targetDemography: string | null;
  targetProfession: string | null;
  targetPersonality: string | null;
}

const TargetAudienceSection: React.FC<TargetAudienceSectionProps> = ({
  targetAge,
  targetGender,
  targetDemography,
  targetProfession,
  targetPersonality
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h4 className="font-medium">Target Age</h4>
        <p className="mt-1">{targetAge || "Not provided"}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Target Gender</h4>
        <p className="mt-1">{targetGender || "Not provided"}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Target Demography</h4>
        <p className="mt-1">{targetDemography || "Not provided"}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Target Profession</h4>
        <p className="mt-1">{targetProfession || "Not provided"}</p>
      </div>
      
      <div className="md:col-span-2">
        <h4 className="font-medium">Target Personality</h4>
        <p className="mt-1">{targetPersonality || "Not provided"}</p>
      </div>
    </div>
  );
};

export default TargetAudienceSection;
