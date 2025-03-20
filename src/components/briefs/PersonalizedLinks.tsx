
import React from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface PersonalizedLinksProps {
  currentUserId: string | null;
  baseUrl: string;
}

const PersonalizedLinks: React.FC<PersonalizedLinksProps> = ({ currentUserId, baseUrl }) => {
  if (!currentUserId) return null;

  const copyBriefLink = (briefType: string) => {
    let url = "";
    switch (briefType) {
      case "ui":
        url = `${baseUrl}/ui-design-brief?for=${currentUserId}`;
        break;
      case "illustration":
        url = `${baseUrl}/illustrations-brief?for=${currentUserId}`;
        break;
      case "graphic":
        url = `${baseUrl}/graphic-design-brief?for=${currentUserId}`;
        break;
      default:
        toast.error("Invalid brief type");
        return;
    }

    navigator.clipboard.writeText(url)
      .then(() => {
        toast.success(`${briefType.charAt(0).toUpperCase() + briefType.slice(1)} Design Brief link copied to clipboard`);
      })
      .catch(err => {
        console.error("Error copying link:", err);
        toast.error("Failed to copy link to clipboard");
      });
  };

  return (
    <div className="bg-white p-4 rounded-md border shadow-sm mt-4 mb-6">
      <h3 className="text-lg font-medium mb-3">Your Personalized Brief Links</h3>
      <p className="text-sm text-gray-600 mb-3">
        Share these links with your clients to directly receive briefs assigned to you.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex">
          <input 
            type="text" 
            value={`${baseUrl}/ui-design-brief?for=${currentUserId}`} 
            readOnly
            className="flex-1 px-3 py-2 border rounded-l-md text-sm bg-gray-50" 
          />
          <Button 
            variant="outline" 
            className="rounded-l-none border-l-0" 
            onClick={() => copyBriefLink("ui")}
          >
            <Copy className="h-4 w-4" />
            <span className="sr-only">Copy UI Brief Link</span>
          </Button>
        </div>
        <div className="flex">
          <input 
            type="text" 
            value={`${baseUrl}/illustrations-brief?for=${currentUserId}`} 
            readOnly
            className="flex-1 px-3 py-2 border rounded-l-md text-sm bg-gray-50" 
          />
          <Button 
            variant="outline" 
            className="rounded-l-none border-l-0" 
            onClick={() => copyBriefLink("illustration")}
          >
            <Copy className="h-4 w-4" />
            <span className="sr-only">Copy Illustration Brief Link</span>
          </Button>
        </div>
        <div className="flex">
          <input 
            type="text" 
            value={`${baseUrl}/graphic-design-brief?for=${currentUserId}`} 
            readOnly
            className="flex-1 px-3 py-2 border rounded-l-md text-sm bg-gray-50" 
          />
          <Button 
            variant="outline" 
            className="rounded-l-none border-l-0" 
            onClick={() => copyBriefLink("graphic")}
          >
            <Copy className="h-4 w-4" />
            <span className="sr-only">Copy Graphic Brief Link</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedLinks;
