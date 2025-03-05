
import React, { useState } from "react";
import { toast } from "sonner";
import { generateIllustrationBriefPDF, generateUIDesignBriefPDF, generateGraphicDesignBriefPDF } from "@/utils/briefPdfGenerator";
import BriefDetailsDialog from "./BriefDetailsDialog";
import DeleteBriefDialog from "./DeleteBriefDialog";

interface Brief {
  id: number;
  name: string;
  email: string;
  companyName: string;
  type: string;
  status: string;
  submissionDate: string;
}

interface BriefFunctionsProps {
  briefs: Brief[];
  setBriefs: React.Dispatch<React.SetStateAction<Brief[]>>;
}

const BriefFunctions: React.FC<BriefFunctionsProps> = ({ briefs, setBriefs }) => {
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [briefDetails, setBriefDetails] = useState<any>(null);

  const viewBriefDetails = (brief: Brief) => {
    const storedBriefs = localStorage.getItem("briefs");
    if (storedBriefs) {
      const allBriefs = JSON.parse(storedBriefs);
      const fullBrief = allBriefs.find((b: any) => b.id === brief.id);
      if (fullBrief) {
        setBriefDetails(fullBrief);
        setIsViewDialogOpen(true);
      }
    }
  };

  const handleDeleteBrief = (brief: Brief) => {
    setSelectedBrief(brief);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedBrief) {
      const updatedBriefs = briefs.filter(brief => brief.id !== selectedBrief.id);
      localStorage.setItem("briefs", JSON.stringify(updatedBriefs));
      setBriefs(updatedBriefs);
      setIsDeleteDialogOpen(false);
      setSelectedBrief(null);
      toast.success("Brief deleted successfully!");
    }
  };

  const downloadBrief = async (brief: Brief) => {
    try {
      const storedBriefs = localStorage.getItem("briefs");
      if (storedBriefs) {
        const allBriefs = JSON.parse(storedBriefs);
        const fullBrief = allBriefs.find((b: any) => b.id === brief.id);
        if (fullBrief) {
          if (fullBrief.type === "Illustration Design" || fullBrief.type === "Illustrations") {
            await generateIllustrationBriefPDF(fullBrief);
            toast.success("Illustration brief downloaded successfully");
          } else if (fullBrief.type === "UI Design") {
            await generateUIDesignBriefPDF(fullBrief);
            toast.success("UI Design brief downloaded successfully");
          } else if (fullBrief.type === "Graphic Design") {
            await generateGraphicDesignBriefPDF(fullBrief);
            toast.success("Graphic Design brief downloaded successfully");
          } else {
            toast.error("Download not supported for this brief type");
          }
        }
      }
    } catch (error) {
      console.error("Error downloading brief:", error);
      toast.error("Failed to download brief. Please try again.");
    }
  };

  return (
    <>
      <DeleteBriefDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
      />

      <BriefDetailsDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        briefDetails={briefDetails}
        onDownload={downloadBrief}
      />
    </>
  );
};

export default BriefFunctions;
