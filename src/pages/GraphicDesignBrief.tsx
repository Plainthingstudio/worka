
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import GraphicDesignBriefForm from "@/components/graphic-design-brief/GraphicDesignBriefForm";
import { supabase } from "@/integrations/supabase/client";

const GraphicDesignBrief = () => {
  const location = useLocation();
  const [designerName, setDesignerName] = useState<string | null>(null);
  
  // Extract the 'for' query parameter
  const params = new URLSearchParams(location.search);
  const forUserId = params.get('for');
  
  useEffect(() => {
    // If there's a forUserId, try to fetch the user's name
    if (forUserId) {
      const fetchUserInfo = async () => {
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', forUserId)
            .single();
            
          if (error) {
            console.error("Error fetching designer info:", error);
            return;
          }
          
          if (profileData) {
            setDesignerName(profileData.full_name);
          }
        } catch (err) {
          console.error("Error in fetchUserInfo:", err);
        }
      };
      
      fetchUserInfo();
    }
  }, [forUserId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12">
      <div className="container max-w-2xl mx-auto px-4">
        {designerName && (
          <div className="bg-blue-50 text-blue-700 p-4 rounded-md mb-4 text-center">
            You're submitting a brief for <strong>{designerName}</strong>
          </div>
        )}
        <GraphicDesignBriefForm />
      </div>
    </div>
  );
};

export default GraphicDesignBrief;
