
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const BriefPersonalizedLinks = () => {
  const [copied, setCopied] = useState<Record<string, boolean>>({
    graphic: false,
    ui: false,
    illustration: false
  });
  const [userId, setUserId] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchUserId = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      }
    };
    
    fetchUserId();
  }, []);

  if (!userId) {
    return null; // Only show to logged-in users
  }

  const baseUrl = window.location.origin;
  const briefLinks = {
    graphic: `${baseUrl}/graphic-design-brief?for=${userId}`,
    ui: `${baseUrl}/ui-design-brief?for=${userId}`,
    illustration: `${baseUrl}/illustrations-brief?for=${userId}`
  };

  const handleCopyLink = (type: 'graphic' | 'ui' | 'illustration') => {
    navigator.clipboard.writeText(briefLinks[type])
      .then(() => {
        // Set the copied state for this specific button
        setCopied(prev => ({ ...prev, [type]: true }));
        
        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setCopied(prev => ({ ...prev, [type]: false }));
        }, 2000);
        
        toast.success("Link copied to clipboard");
      })
      .catch(err => {
        console.error("Failed to copy link:", err);
        toast.error("Failed to copy link");
      });
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-2">
          <Link2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Your Personalized Brief Links</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Share these links with your clients to directly receive briefs assigned to you.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 border rounded-md">
            <div className="truncate px-3 py-2 text-sm flex-1 bg-muted/50">
              {briefLinks.graphic}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-full rounded-l-none" 
              onClick={() => handleCopyLink('graphic')}
              title="Copy Graphic Design Brief Link"
            >
              {copied.graphic ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="flex items-center gap-2 border rounded-md">
            <div className="truncate px-3 py-2 text-sm flex-1 bg-muted/50">
              {briefLinks.ui}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-full rounded-l-none" 
              onClick={() => handleCopyLink('ui')}
              title="Copy UI Design Brief Link"
            >
              {copied.ui ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="flex items-center gap-2 border rounded-md">
            <div className="truncate px-3 py-2 text-sm flex-1 bg-muted/50">
              {briefLinks.illustration}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-full rounded-l-none" 
              onClick={() => handleCopyLink('illustration')}
              title="Copy Illustration Brief Link"
            >
              {copied.illustration ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BriefPersonalizedLinks;
