
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import GraphicDesignBriefForm from "@/components/graphic-design-brief/GraphicDesignBriefForm";

const GraphicDesignBrief = () => {
  const [searchParams] = useSearchParams();
  const forUserId = searchParams.get("u");
  const [isValidUser, setIsValidUser] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUserExists = async () => {
      if (!forUserId) {
        setIsValidUser(true); // No specific user, so form is valid for general submission
        return;
      }

      try {
        const normalizedUserId = forUserId.trim();
        const isValidAppwriteId = normalizedUserId.length > 0 && normalizedUserId.length <= 36;

        if (isValidAppwriteId) {
          console.log("Accepted submitted-for user ID:", normalizedUserId);
          setIsValidUser(true);
        } else {
          console.error("Invalid Appwrite user ID");
          setIsValidUser(false);
        }
      } catch (err) {
        console.error("Error verifying user:", err);
        setIsValidUser(false);
      }
    };

    checkUserExists();
  }, [forUserId]);

  if (isValidUser === false) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12">
        <div className="container max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-semibold text-red-500 mb-4">Invalid Form Link</h2>
          <p className="text-gray-600">
            This form link appears to be invalid or has expired. Please contact the person who shared this link with you.
          </p>
        </div>
      </div>
    );
  }

  if (isValidUser === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12">
        <div className="container max-w-2xl mx-auto px-4 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <GraphicDesignBriefForm submittedForId={forUserId} />
      </div>
    </div>
  );
};

export default GraphicDesignBrief;
