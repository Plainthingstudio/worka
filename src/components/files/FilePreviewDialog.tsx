import React, { useEffect, useState } from "react";
import { Download, ExternalLink, FileQuestion, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { downloadFileFromUrl } from "@/utils/fileDownload";
import { fetchAuthenticatedAppwriteFileBlob } from "@/utils/filePreview";

export interface FilePreviewItem {
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  bucketId?: string;
  fileId?: string;
  previewUrl?: string;
  downloadUrl?: string;
}

interface FilePreviewDialogProps extends FilePreviewItem {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;

  return `${value >= 10 || index === 0 ? Math.round(value) : value.toFixed(1)} ${units[index]}`;
};

const getPreviewKind = (fileType?: string) => {
  const normalizedType = (fileType || "").toLowerCase();
  if (normalizedType.startsWith("image/")) return "image";
  if (normalizedType.includes("pdf")) return "pdf";
  return "unsupported";
};

export const FilePreviewDialog: React.FC<FilePreviewDialogProps> = ({
  open,
  onOpenChange,
  fileName,
  fileUrl,
  fileType,
  fileSize,
  bucketId,
  fileId,
  previewUrl,
  downloadUrl,
}) => {
  const previewKind = getPreviewKind(fileType);
  const fileSizeLabel = formatFileSize(fileSize);
  const metadata = [fileType, fileSizeLabel].filter(Boolean).join(" • ");
  const [isDownloading, setIsDownloading] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const resolvedPreviewUrl = previewUrl || fileUrl;
  const resolvedDownloadUrl = downloadUrl || fileUrl;
  const displayPreviewUrl = localPreviewUrl || resolvedPreviewUrl;

  useEffect(() => {
    if (!open || previewKind === "unsupported" || !bucketId || !fileId) {
      setLocalPreviewUrl(null);
      setPreviewError(null);
      setIsPreviewLoading(false);
      return;
    }

    let isActive = true;
    let objectUrl: string | null = null;

    const loadAuthenticatedPreview = async () => {
      setIsPreviewLoading(true);
      setPreviewError(null);
      setLocalPreviewUrl(null);

      try {
        const blob = await fetchAuthenticatedAppwriteFileBlob({ bucketId, fileId, fileType });
        objectUrl = URL.createObjectURL(blob);
        if (isActive) setLocalPreviewUrl(objectUrl);
      } catch (error) {
        console.error("Error loading authenticated file preview:", error);
        if (isActive) setPreviewError("Preview failed to load. You can still open or download the file.");
      } finally {
        if (isActive) setIsPreviewLoading(false);
      }
    };

    loadAuthenticatedPreview();

    return () => {
      isActive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [bucketId, fileId, fileType, open, previewKind]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadFileFromUrl(resolvedDownloadUrl, fileName);
    } catch (error) {
      console.error("Error downloading file:", error);
      window.open(resolvedDownloadUrl, "_blank", "noopener,noreferrer");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-[min(1040px,calc(100vw-32px))] grid-rows-[auto_minmax(0,1fr)] flex-col gap-4 overflow-hidden p-0">
        <DialogHeader className="border-b border-border-soft px-5 py-4 pr-12">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <DialogTitle className="truncate text-base">{fileName}</DialogTitle>
              <DialogDescription className="mt-1 truncate">
                {metadata || "File preview"}
              </DialogDescription>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button asChild size="icon" variant="ghost" className="h-8 w-8" title="Open in new tab">
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" aria-label="Open in new tab">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                title="Download file"
                onClick={handleDownload}
                disabled={isDownloading}
                aria-label="Download file"
              >
                {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 bg-surface-2 px-4 pb-4">
          {previewKind !== "unsupported" && (isPreviewLoading || previewError) && (
            <div className="flex h-[min(72vh,720px)] flex-col items-center justify-center rounded-lg border border-border-soft bg-background px-6 text-center">
              {isPreviewLoading ? (
                <>
                  <Loader2 className="mb-3 h-6 w-6 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading preview...</p>
                </>
              ) : (
                <>
                  <FileQuestion className="mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">Preview failed to load.</p>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">{previewError}</p>
                </>
              )}
            </div>
          )}

          {previewKind === "image" && !isPreviewLoading && !previewError && (
            <div className="flex h-[min(72vh,720px)] items-center justify-center overflow-auto rounded-lg border border-border-soft bg-background">
              <img
                src={displayPreviewUrl}
                alt={fileName}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}

          {previewKind === "pdf" && !isPreviewLoading && !previewError && (
            <div className="h-[min(72vh,720px)] overflow-hidden rounded-lg border border-border-soft bg-background">
              <iframe
                title={fileName}
                src={displayPreviewUrl}
                className="h-full w-full"
              />
            </div>
          )}

          {previewKind === "unsupported" && (
            <div className="flex h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-border-soft bg-background px-6 text-center">
              <FileQuestion className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Preview is not available for this file type.</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Open the file in a new tab or download it to view the contents.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Open
                  </a>
                </Button>
                <Button type="button" size="sm" onClick={handleDownload} disabled={isDownloading}>
                  {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Download
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
