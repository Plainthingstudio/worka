import React from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import BriefsHeader from "@/components/briefs/BriefsHeader";
import BriefStats from "@/components/briefs/BriefStats";
import BriefsFilter from "@/components/briefs/BriefsFilter";
import BriefsTable from "@/components/briefs/BriefsTable";
import BriefTypeCards from "@/components/briefs/BriefTypeCards";
import BriefDetailsDialog from "@/components/briefs/BriefDetailsDialog";
import DeleteBriefDialog from "@/components/briefs/DeleteBriefDialog";
import { useBriefs } from "@/hooks/useBriefs";
import { toast } from "sonner";
import { 
  generateIllustrationBriefPDF, 
  generateUIDesignBriefPDF, 
  generateGraphicDesignBriefPDF 
} from "@/utils/briefPdfGenerator";

const Briefs = () => {
  const { briefs, setBriefs, filter, setFilter, search, setSearch, filteredBriefs } = useBriefs();
  const [selectedBrief, setSelectedBrief] = React.useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [briefDetails, setBriefDetails] = React.useState<any>(null);

  const viewBriefDetails = (brief: any) => {
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

  const handleDeleteBrief = (brief: any) => {
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

  const downloadBrief = async (brief: any) => {
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
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-14 md:pl-56">
        <Navbar title="Briefs" />
        <main className="container py-6">
          <BriefsHeader />
          <BriefStats briefs={briefs} />
          <BriefsFilter 
            filter={filter}
            setFilter={setFilter}
            search={search}
            setSearch={setSearch}
          />
          <BriefsTable 
            briefs={filteredBriefs} 
            onView={viewBriefDetails}
            onDownload={downloadBrief}
            onDelete={handleDeleteBrief}
          />
          <BriefTypeCards />
        </main>
      </div>

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
    </div>
  );
};

export default Briefs;
