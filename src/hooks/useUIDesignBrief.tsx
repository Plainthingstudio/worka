import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

export const useUIDesignBrief = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract the 'for' query parameter which contains the designer's user ID
  const params = new URLSearchParams(location.search);
  const forUserId = params.get('for');

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    console.log("Form data:", data);

    try {
      // Get the authenticated user (if any)
      const { data: { user } } = await supabase.auth.getUser();
      
      // Determine which user ID to use for the brief
      // If the brief is being submitted for a specific designer, use their ID
      // Otherwise use the current authenticated user's ID
      const effectiveUserId = forUserId || (user ? user.id : null);
      
      console.log("Submitting UI design brief with user_id:", effectiveUserId);

      // Make sure important fields are properly formatted before submission
      const formattedData = {
        ...data,
        page_count: Number(data.pageCount || 0),
        user_id: effectiveUserId,
        submission_date: new Date().toISOString()
      };

      const { error } = await supabase.from("ui_design_briefs").insert(formattedData);

      if (error) {
        console.error("Error submitting UI design brief:", error);
        toast.error("Failed to submit brief. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Store in localStorage as well
      try {
        const storedBriefs = localStorage.getItem("briefs");
        const briefs = storedBriefs ? JSON.parse(storedBriefs) : [];
        
        briefs.push({
          ...formattedData,
          id: uuidv4(),
          type: "UI Design",
          status: "New"
        });
        
        localStorage.setItem("briefs", JSON.stringify(briefs));
      } catch (e) {
        console.error("Error saving to localStorage:", e);
      }

      toast.success("UI design brief submitted successfully!");
      navigate("/thank-you");
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting
  };
};

export default useUIDesignBrief;
