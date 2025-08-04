
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, ExternalLink, Unlink, Download } from 'lucide-react';
import { Brief } from '@/types/brief';
import { useBriefConnection } from '@/hooks/useBriefConnection';
import { useBriefDownload } from '@/hooks/useBriefDownload';
import { useUserRole } from '@/hooks/useUserRole';
import BriefDetailsDialog from '@/components/briefs/BriefDetailsDialog';

interface BriefSelectorProps {
  taskId: string;
  currentBrief?: {
    id: string;
    type: string;
    name?: string;
    company_name?: string;
  } | null;
  onBriefChange?: () => void;
}

export const BriefSelector = ({ taskId, currentBrief, onBriefChange }: BriefSelectorProps) => {
  const [availableBriefs, setAvailableBriefs] = useState<Brief[]>([]);
  const [briefDetails, setBriefDetails] = useState<any>(null);
  const [showBriefDialog, setShowBriefDialog] = useState(false);
  const { 
    isLoading, 
    fetchAvailableBriefs, 
    connectBriefToTask, 
    disconnectBriefFromTask, 
    fetchBriefDetails 
  } = useBriefConnection();
  
  const { isDownloading, downloadBrief } = useBriefDownload();
  const { userRole, isLoading: roleLoading } = useUserRole();

  useEffect(() => {
    loadAvailableBriefs();
  }, []);

  useEffect(() => {
    if (currentBrief?.id && currentBrief?.type) {
      loadBriefDetails();
    }
  }, [currentBrief]);

  const loadAvailableBriefs = async () => {
    const briefs = await fetchAvailableBriefs();
    setAvailableBriefs(briefs);
  };

  const loadBriefDetails = async () => {
    if (currentBrief?.id && currentBrief?.type) {
      const details = await fetchBriefDetails(currentBrief.id, currentBrief.type);
      setBriefDetails(details);
    }
  };

  const handleBriefSelect = async (briefId: string) => {
    console.log('Selecting brief:', briefId);
    const selectedBrief = availableBriefs.find(b => b.id === briefId);
    if (selectedBrief) {
      console.log('Found brief:', selectedBrief);
      const success = await connectBriefToTask(taskId, briefId, selectedBrief.type);
      if (success && onBriefChange) {
        onBriefChange();
      }
    } else {
      console.error('Brief not found:', briefId);
    }
  };

  const handleDisconnect = async () => {
    const success = await disconnectBriefFromTask(taskId);
    if (success && onBriefChange) {
      onBriefChange();
    }
  };

  const handleViewBrief = () => {
    if (briefDetails) {
      setShowBriefDialog(true);
    }
  };

  const handleDownloadBrief = async () => {
    if (currentBrief?.id && currentBrief?.type) {
      await downloadBrief(currentBrief.id, currentBrief.type);
    }
  };

  const handleDownloadFromDialog = async (brief: any) => {
    if (brief?.id && brief?.type) {
      await downloadBrief(brief.id, brief.type);
    }
  };

  const getBriefTypeColor = (type: string) => {
    switch (type) {
      case 'UI Design': return 'bg-blue-500';
      case 'Graphic Design': return 'bg-green-500';
      case 'Illustration Design': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FileText className="h-4 w-4" />
        Connected Brief
      </div>

      {currentBrief ? (
        <div className="space-y-3">
          <div className="p-3 border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <Badge className={`${getBriefTypeColor(currentBrief.type)} text-white text-xs`}>
                {currentBrief.type}
              </Badge>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownloadBrief}
                  disabled={isDownloading}
                  className="h-6 text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  {isDownloading ? 'Downloading...' : 'Download'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewBrief}
                  className="h-6 text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
                {!roleLoading && userRole !== 'team' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDisconnect}
                    className="h-6 text-xs text-destructive hover:text-destructive"
                    disabled={isLoading}
                  >
                    <Unlink className="h-3 w-3 mr-1" />
                    Unlink
                  </Button>
                )}
              </div>
            </div>
            
            {briefDetails && (
              <div className="text-sm">
                <div className="font-medium">{briefDetails.name}</div>
                <div className="text-muted-foreground">{briefDetails.company_name}</div>
                {briefDetails.status && (
                  <Badge variant="category" className="mt-1 text-xs">
                    {briefDetails.status}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Select onValueChange={handleBriefSelect} disabled={isLoading}>
            <SelectTrigger className="text-sm h-9">
              <SelectValue placeholder="Connect to a brief..." />
            </SelectTrigger>
            <SelectContent className="bg-background border z-[80]">
              {availableBriefs.map((brief) => (
                <SelectItem key={brief.id} value={brief.id}>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getBriefTypeColor(brief.type)} text-white text-xs`}>
                      {brief.type}
                    </Badge>
                    <span className="truncate">{brief.name} - {brief.companyName || brief.company_name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {availableBriefs.length === 0 && (
            <div className="text-xs text-muted-foreground">
              No briefs available to connect
            </div>
          )}
        </div>
      )}

      <BriefDetailsDialog
        open={showBriefDialog}
        onOpenChange={setShowBriefDialog}
        briefDetails={briefDetails}
        onDownload={handleDownloadFromDialog}
      />
    </div>
  );
};
