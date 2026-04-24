
import React, { useState, useEffect } from "react";
import BriefsHeader from "@/components/briefs/BriefsHeader";
import BriefStats from "@/components/briefs/BriefStats";
import BriefsFilter from "@/components/briefs/BriefsFilter";
import BriefsTable from "@/components/briefs/BriefsTable";
import BriefTypeCards from "@/components/briefs/BriefTypeCards";
import BriefDetailsDialog from "@/components/briefs/BriefDetailsDialog";
import DeleteBriefDialog from "@/components/briefs/DeleteBriefDialog";
import BriefPersonalizedLinks from "@/components/briefs/BriefPersonalizedLinks";
import { useBriefs } from "@/hooks/useBriefs";
import { useBriefPdf } from "@/hooks/useBriefPdf";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { account } from "@/integrations/appwrite/client";
import { toast } from "sonner";

const Briefs = () => {
  const { briefs, setBriefs, filter, setFilter, search, setSearch, filteredBriefs, isLoading, deleteBrief, fetchBriefs } = useBriefs();
  const { generateBriefPDF, isDownloading } = useBriefPdf();
  const [selectedBrief, setSelectedBrief] = React.useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [briefDetails, setBriefDetails] = React.useState<any>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);


  const refreshData = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      console.log("Refreshing briefs data...");

      let user;
      try {
        user = await account.get();
      } catch {
        user = null;
      }

      if (!user) {
        console.log("Non-authenticated user viewing briefs");
        toast.info("You're viewing briefs in read-only mode. Login to manage briefs.");
      }

      await fetchBriefs();
      setIsInitialLoad(false);
    } catch (error) {
      console.error("Error refreshing briefs data:", error);
      toast.error("Failed to refresh briefs data");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    console.log("Initial briefs fetch on component mount");
    refreshData();

    const refreshInterval = setInterval(() => {
      console.log("Performing periodic refresh of briefs data");
      refreshData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
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
    if (!selectedBrief || isDeleting) return;

    try {
      setIsDeleting(true);
      console.log("Starting brief deletion process for ID:", selectedBrief.id);

      let user;
      try {
        user = await account.get();
      } catch {
        user = null;
      }

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

  return (
    <>
      <main className="w-full px-6 py-6">
          <BriefsHeader />
          <BriefStats briefs={briefs} />

          <BriefPersonalizedLinks />

          <BriefsFilter
            filter={filter}
            setFilter={setFilter}
            search={search}
            setSearch={setSearch}
          />

          {isLoading && isInitialLoad ? (
            <div className="space-y-4">
              <div className="flex justify-center items-center h-12 mb-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg font-medium">Loading briefs...</span>
              </div>

              <div className="rounded-md border">
                <div className="p-4">
                  <div className="grid grid-cols-6 gap-4 mb-4">
                    <Skeleton className="h-6 col-span-1" />
                    <Skeleton className="h-6 col-span-1" />
                    <Skeleton className="h-6 col-span-1" />
                    <Skeleton className="h-6 col-span-1" />
                    <Skeleton className="h-6 col-span-1" />
                    <Skeleton className="h-6 col-span-1" />
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="py-4 border-t">
                      <div className="grid grid-cols-6 gap-4">
                        <Skeleton className="h-10 col-span-1" />
                        <Skeleton className="h-10 col-span-1" />
                        <Skeleton className="h-10 col-span-1" />
                        <Skeleton className="h-10 col-span-1" />
                        <Skeleton className="h-10 col-span-1" />
                        <Skeleton className="h-10 col-span-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <BriefsTable
                briefs={filteredBriefs}
                onView={viewBriefDetails}
                onDownload={generateBriefPDF}
                onDelete={handleDeleteBrief}
              />
              {isRefreshing && !isInitialLoad && (
                <div className="flex justify-center items-center mt-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                  <span>Refreshing briefs...</span>
                </div>
              )}
            </>
          )}

        <BriefTypeCards />
      </main>

      <DeleteBriefDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        briefName={selectedBrief?.name || (selectedBrief && typeof selectedBrief === 'object' ? selectedBrief.company_name : "this brief")}
      />

      <BriefDetailsDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        briefDetails={briefDetails}
        onDownload={generateBriefPDF}
      />
    </>
  );
};

export default Briefs;
