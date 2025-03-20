
import React from "react";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const BriefsLoading: React.FC = () => {
  return (
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
  );
};

export default BriefsLoading;
