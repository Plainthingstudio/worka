
import React, { useState, useEffect } from "react";
import { Brief } from "@/types/brief";
import BriefsHeader from "./BriefsHeader";
import BriefStats from "./BriefStats";
import BriefsContent from "./BriefsContent";
import BriefDetailsDialog from "./BriefDetailsDialog";
import DeleteBriefDialog from "./DeleteBriefDialog";
import { toast } from "sonner";
import { 
  generateIllustrationBriefPDF, 
  generateUIDesignBriefPDF, 
  generateGraphicDesignBriefPDF 
} from "@/utils/briefPdfGenerator";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";

interface BriefsContainerProps {
  briefs: Brief[];
  setBriefs: (briefs: Brief[]) => void;
  filter: string;
  setFilter: (filter: string) => void;
  search: string;
  setSearch: (search: string) => void;
  filteredBriefs: Brief[];
  isLoading: boolean;
  fetchBriefs: () => Promise<void>;
  deleteBrief: (id: string) => Promise<void>;
  clearLocalBriefs?: () => boolean; // Added optional prop for clearing localStorage
}

const BriefsContainer: React.FC<BriefsContainerProps> = ({
  briefs,
  setBriefs,
  filter,
  setFilter,
  search,
  setSearch,
  filteredBriefs,
  isLoading,
  fetchBriefs,
  deleteBrief,
  clearLocalBriefs,
}) => {
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [briefDetails, setBriefDetails] = useState<Brief | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const refreshData = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    setFetchError(null);
    
    try {
      console.log("Refreshing briefs data...");
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("Non-authenticated user viewing briefs");
        toast.info("You're viewing briefs in read-only mode. Login to manage briefs.");
      } else {
        setCurrentUserId(user.id);
        console.log("Current user ID:", user.id);
      }
      
      await fetchBriefs();
      setIsInitialLoad(false);
    } catch (error: any) {
      console.error("Error refreshing briefs data:", error);
      setFetchError(error.message || "Failed to refresh briefs data");
      toast.error("Failed to refresh briefs data");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    console.log("Initial briefs fetch on component mount");
    refreshData();
  }, []);

  const viewBriefDetails = (brief: Brief) => {
    setBriefDetails(brief);
    setIsViewDialogOpen(true);
  };

  const handleDeleteBrief = (brief: Brief) => {
    setSelectedBrief(brief);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedBrief || isDeleting) return;
    
    try {
      setIsDeleting(true);
      console.log("Starting brief deletion process for ID:", selectedBrief.id);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to delete briefs");
        setIsDeleteDialogOpen(false);
        setIsDeleting(false);
        return;
      }
      
      await deleteBrief(selectedBrief.id);
      
      setSelectedBrief(null);
      
      setIsDeleteDialogOpen(false);
      
      setTimeout(() => {
        refreshData();
      }, 500);
      
      toast.success("Brief permanently deleted");
    } catch (error) {
      console.error("Error during brief deletion:", error);
      toast.error("Failed to delete brief. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const downloadBrief = async (brief: Brief) => {
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

  const handleClearLocalStorage = () => {
    if (clearLocalBriefs && clearLocalBriefs()) {
      toast.success("Local brief data cleared successfully");
      refreshData();
    } else {
      toast.error("Failed to clear local brief data");
    }
  };

  return (
    <>
      <BriefsHeader />
      <BriefStats briefs={briefs} />
      
      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">Error loading briefs: {fetchError}</p>
          <button 
            onClick={refreshData}
            className="text-xs text-red-800 underline mt-1"
          >
            Try again
          </button>
        </div>
      )}
      
      {briefs.length > 0 && (
        <div className="mb-4 flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-destructive"
            onClick={handleClearLocalStorage}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Clear Local Cache
          </Button>
        </div>
      )}
      
      <BriefsContent
        briefs={briefs}
        filter={filter}
        setFilter={setFilter}
        search={search}
        setSearch={setSearch}
        filteredBriefs={filteredBriefs}
        isLoading={isLoading}
        isInitialLoad={isInitialLoad}
        isRefreshing={isRefreshing}
        currentUserId={currentUserId}
        onViewBrief={viewBriefDetails}
        onDownloadBrief={downloadBrief}
        onDeleteBrief={handleDeleteBrief}
      />

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
    </>
  );
};

export default BriefsContainer;
