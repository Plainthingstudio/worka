
import React from "react";
import { getValue, getPageDetails } from "./UIHelperFunctions";

interface PageDetailsSectionProps {
  briefDetails: any;
}

const PageDetailsSection: React.FC<PageDetailsSectionProps> = ({ briefDetails }) => {
  return (
    <>
      <div>
        <h4 className="font-medium">Number of Pages</h4>
        <p className="mt-1">{getValue(briefDetails, "pageCount", "page_count")}</p>
      </div>
      
      {getPageDetails(briefDetails).length > 0 && (
        <div>
          <h4 className="font-medium">Page Details</h4>
          <div className="space-y-2 mt-1">
            {getPageDetails(briefDetails).map((detail: any, index: number) => {
              const detailName = detail?.name || "Unnamed Page";
              const detailDescription = detail?.description || "No description provided";
              
              return (
                <div key={index} className="border p-3 rounded-md">
                  <p className="font-medium">Page {index + 1}: {detailName}</p>
                  <p>{detailDescription}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default PageDetailsSection;
