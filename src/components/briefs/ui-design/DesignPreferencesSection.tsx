
import React from "react";
import { getValue, hasReferences } from "./UIHelperFunctions";

interface DesignPreferencesSectionProps {
  briefDetails: any;
}

const DesignPreferencesSection: React.FC<DesignPreferencesSectionProps> = ({ briefDetails }) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium">Design Preferences</h4>
        <p className="mt-1">{getValue(briefDetails, "generalStyle", "general_style")}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Color Preferences</h4>
        <p className="mt-1">{getValue(briefDetails, "colorPreferences", "color_preferences")}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Font Preferences</h4>
        <p className="mt-1">{getValue(briefDetails, "fontPreferences", "font_preferences")}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Style Preferences</h4>
        <p className="mt-1">{getValue(briefDetails, "stylePreferences", "style_preferences")}</p>
      </div>
      
      {/* Design References */}
      <div>
        <h4 className="font-medium">Design References</h4>
        <div className="space-y-2 mt-1">
          {getValue(briefDetails, "reference1", "reference1", "") !== "Not provided" && 
            <p>1. {getValue(briefDetails, "reference1", "reference1")}</p>}
          {getValue(briefDetails, "reference2", "reference2", "") !== "Not provided" && 
            <p>2. {getValue(briefDetails, "reference2", "reference2")}</p>}
          {getValue(briefDetails, "reference3", "reference3", "") !== "Not provided" && 
            <p>3. {getValue(briefDetails, "reference3", "reference3")}</p>}
          {getValue(briefDetails, "reference4", "reference4", "") !== "Not provided" && 
            <p>4. {getValue(briefDetails, "reference4", "reference4")}</p>}
          {!hasReferences(briefDetails) && <p>None provided</p>}
        </div>
      </div>
    </div>
  );
};

export default DesignPreferencesSection;
