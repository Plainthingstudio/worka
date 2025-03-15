
import React, { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";

const Briefs = () => {
  const { briefs, filter, setFilter, search, setSearch, filteredBriefs, isLoading, deleteBrief } = useBriefs();
  const [selectedBrief, setSelectedBrief] = React.useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [briefDetails, setBriefDetails] = React.useState<any>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarChange = () => {
      const sidebarElement = document.querySelector('[class*="w-56"], [class*="w-14"]');
      setIsSidebarExpanded(sidebarElement?.classList.contains('w-56') || false);
    };

    // Initial check
    handleSidebarChange();

    // Set up mutation observer to watch for class changes on the sidebar
    const observer = new MutationObserver(handleSidebarChange);
    const sidebarElement = document.querySelector('[class*="flex flex-col border-r"]');
    
    if (sidebarElement) {
      observer.observe(sidebarElement, { attributes: true, attributeFilter: ['class'] });
    }

    return () => observer.disconnect();
  }, []);

  const viewBriefDetails = (brief: any) => {
    setBriefDetails(brief);
    setIsViewDialogOpen(true);
  };

  const handleDeleteBrief = (brief: any) => {
    setSelectedBrief(brief);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedBrief) {
      try {
        await deleteBrief(selectedBrief.id);
        toast.success("Brief deleted successfully!");
      } catch (error) {
        console.error("Error during brief deletion:", error);
        toast.error("Failed to delete brief. Please try again.");
      }
    }
  };

  const downloadBrief = async (brief: any) => {
    try {
      if (brief.type === "Illustration Design" || brief.type === "Illustrations") {
        await generateIllustrationBriefPDF(brief);
        toast.success("Illustration brief downloaded successfully");
      } else if (brief.type === "UI Design") {
        await generateUIDesignBriefPDF(brief);
        toast.success("UI Design brief downloaded successfully");
      } else if (brief.type === "Graphic Design") {
        await generateGraphicDesignBriefPDF(brief);
        toast.success("Graphic Design brief downloaded successfully");
      } else {
        toast.error("Download not supported for this brief type");
      }
    } catch (error) {
      console.error("Error downloading brief:", error);
      toast.error("Failed to download brief. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div 
        className={`flex-1 w-full transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? "pl-56" : "pl-14"
        }`}
      >
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
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading briefs...</span>
            </div>
          ) : (
            <BriefsTable 
              briefs={filteredBriefs} 
              onView={viewBriefDetails}
              onDownload={downloadBrief}
              onDelete={handleDeleteBrief}
            />
          )}
          
          <BriefTypeCards />
        </main>
      </div>

      <DeleteBriefDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        briefName={selectedBrief?.name || selectedBrief?.company_name || "this brief"}
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
