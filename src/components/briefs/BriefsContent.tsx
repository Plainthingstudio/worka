
import React, { useState } from "react";
import { Brief } from "@/types/brief";
import BriefsFilter from "./BriefsFilter";
import BriefsTable from "./BriefsTable";
import BriefsLoading from "./BriefsLoading";
import BriefTypeCards from "./BriefTypeCards";
import PersonalizedLinks from "./PersonalizedLinks";
import { Loader2 } from "lucide-react";

interface BriefsContentProps {
  briefs: Brief[];
  filter: string;
  setFilter: (filter: string) => void;
  search: string;
  setSearch: (search: string) => void;
  filteredBriefs: Brief[];
  isLoading: boolean;
  isInitialLoad: boolean;
  isRefreshing: boolean;
  currentUserId: string | null;
  onViewBrief: (brief: Brief) => void;
  onDownloadBrief: (brief: Brief) => void;
  onDeleteBrief: (brief: Brief) => void;
}

const BriefsContent: React.FC<BriefsContentProps> = ({
  briefs,
  filter,
  setFilter,
  search,
  setSearch,
  filteredBriefs,
  isLoading,
  isInitialLoad,
  isRefreshing,
  currentUserId,
  onViewBrief,
  onDownloadBrief,
  onDeleteBrief,
}) => {
  // Get the base URL for creating personalized brief links
  const baseUrl = window.location.origin;

  return (
    <>
      {/* Display personalized brief links for logged-in users */}
      <PersonalizedLinks currentUserId={currentUserId} baseUrl={baseUrl} />
      
      <BriefsFilter 
        filter={filter}
        setFilter={setFilter}
        search={search}
        setSearch={setSearch}
      />
      
      {isLoading && isInitialLoad ? (
        <BriefsLoading />
      ) : (
        <>
          <BriefsTable 
            briefs={filteredBriefs} 
            onView={onViewBrief}
            onDownload={onDownloadBrief}
            onDelete={onDeleteBrief}
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
    </>
  );
};

export default BriefsContent;
