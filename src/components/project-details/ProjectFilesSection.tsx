import React, { useId, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  ExternalLink,
  File,
  FileText,
  Files,
  Image,
  Link,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useProjectFiles } from "@/hooks/useProjectFiles";
import { ProjectFile } from "@/types";
import SectionCardHeader from "./SectionCardHeader";

interface ProjectFilesSectionProps {
  projectId: string;
  mode?: "manage" | "readonly";
  variant?: "card" | "section";
  compact?: boolean;
  stretch?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

const cardStyle: React.CSSProperties = {
  boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
  borderRadius: 12,
  padding: 12,
  display: "flex",
  flexDirection: "column",
  gap: 16,
  boxSizing: "border-box",
  width: "100%",
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;

  return `${value >= 10 || index === 0 ? Math.round(value) : value.toFixed(1)} ${units[index]}`;
};

const getDomain = (value?: string) => {
  if (!value) return "";

  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
};

const getFileIcon = (projectFile: ProjectFile) => {
  if (projectFile.sourceType === "link") return Link;
  if (projectFile.fileType?.startsWith("image/")) return Image;
  if (projectFile.fileType?.includes("pdf") || projectFile.fileType?.startsWith("text/")) return FileText;
  return File;
};

const ProjectFilesSection = ({
  projectId,
  mode = "manage",
  variant = "card",
  compact = false,
  stretch = false,
  title = "Files",
  subtitle = "Important project files and links",
  className,
}: ProjectFilesSectionProps) => {
  const inputId = useId();
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [pendingDeleteFile, setPendingDeleteFile] = useState<ProjectFile | null>(null);

  const {
    files,
    isLoading,
    uploadProjectFile,
    addProjectLink,
    deleteProjectFile,
  } = useProjectFiles(projectId);

  const sortedFiles = useMemo(() => files, [files]);
  const canManage = mode === "manage";
  const isSectionVariant = variant === "section";

  const resetLinkDialog = () => {
    setLinkUrl("");
    setLinkName("");
    setIsLinkDialogOpen(false);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadProjectFile(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddLink = async () => {
    if (!linkUrl.trim()) return;

    setIsAddingLink(true);
    try {
      const success = await addProjectLink({
        name: linkName,
        url: linkUrl.trim(),
      });

      if (success) resetLinkDialog();
    } finally {
      setIsAddingLink(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDeleteFile) return;

    setDeletingFileId(pendingDeleteFile.id);
    try {
      const success = await deleteProjectFile(pendingDeleteFile);
      if (success) setPendingDeleteFile(null);
    } finally {
      setDeletingFileId(null);
    }
  };

  const isBusy = isUploading || isAddingLink || Boolean(deletingFileId);

  return (
    <div
      className={cn(
        !isSectionVariant && "bg-card border border-border-soft",
        isSectionVariant && "w-full",
        className
      )}
      style={{
        ...cardStyle,
        boxShadow: isSectionVariant ? "none" : cardStyle.boxShadow,
        borderRadius: isSectionVariant ? 0 : cardStyle.borderRadius,
        padding: isSectionVariant ? 0 : cardStyle.padding,
        height: stretch ? "100%" : undefined,
        gap: compact ? 12 : 16,
      }}
    >
      {canManage && (
        <input
          id={inputId}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          disabled={isBusy}
        />
      )}

      {isSectionVariant ? (
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold leading-none text-foreground">{title}</h3>
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" disabled={isBusy}>
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => document.getElementById(inputId)?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload file
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsLinkDialogOpen(true)}>
                  <Link className="h-4 w-4 mr-2" />
                  Add link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ) : (
        <SectionCardHeader
          icon={Files}
          title={title}
          subtitle={subtitle}
          action={canManage ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" disabled={isBusy}>
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => document.getElementById(inputId)?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload file
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsLinkDialogOpen(true)}>
                  <Link className="h-4 w-4 mr-2" />
                  Add link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : undefined}
        />
      )}

      {isLoading ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-border-soft py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Loading files...
        </div>
      ) : sortedFiles.length === 0 ? (
        <div className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-dashed border-border-soft px-4 text-center",
          compact ? "py-5" : "py-8"
        )}>
          <Files className="h-5 w-5 text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-foreground">No files added yet</p>
          <p className="text-xs text-muted-foreground mt-1">Keep key assets, briefs, and reference links here.</p>
          {canManage && (
            <Button
              size="sm"
              variant="outline"
              className="mt-4"
              disabled={isBusy}
              onClick={() => document.getElementById(inputId)?.click()}
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Add file
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sortedFiles.map((projectFile) => {
            const Icon = getFileIcon(projectFile);
            const href = projectFile.sourceType === "link" ? projectFile.externalUrl : projectFile.fileUrl;
            const isDeleting = deletingFileId === projectFile.id;

            return (
              <div
                key={projectFile.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-border-soft bg-background px-3 py-2.5",
                  isDeleting && "opacity-60"
                )}
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[8px] border border-border-soft text-brand-accent">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{projectFile.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {projectFile.sourceType === "link"
                      ? getDomain(projectFile.externalUrl)
                      : `${formatFileSize(projectFile.fileSize)} • ${format(projectFile.createdAt, "MMM d, yyyy")}`}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  {href && !isDeleting ? (
                    <Button asChild size="icon" variant="ghost" className="h-8 w-8">
                      <a href={href} target="_blank" rel="noopener noreferrer" aria-label="Open project file">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  ) : (
                    <Button size="icon" variant="ghost" className="h-8 w-8" disabled aria-label="Open project file">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  {canManage && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      disabled={isDeleting}
                      onClick={() => setPendingDeleteFile(projectFile)}
                      aria-label="Delete project file"
                    >
                      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {canManage && (
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add project link</DialogTitle>
            <DialogDescription>
              Save a Figma, Drive, Docs, or reference URL to this project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Input
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              placeholder="https://example.com/file"
              disabled={isAddingLink}
            />
            <Input
              value={linkName}
              onChange={(event) => setLinkName(event.target.value)}
              placeholder="Display name (optional)"
              disabled={isAddingLink}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetLinkDialog} disabled={isAddingLink}>
              Cancel
            </Button>
            <Button onClick={handleAddLink} disabled={isAddingLink || !linkUrl.trim()}>
              {isAddingLink && <Loader2 className="h-4 w-4 animate-spin" />}
              Add link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}

      {canManage && (
      <AlertDialog open={Boolean(pendingDeleteFile)} onOpenChange={(open) => !open && setPendingDeleteFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {pendingDeleteFile?.sourceType === "link" ? "the saved link" : "the uploaded file"} from
              this project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(deletingFileId)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
              disabled={Boolean(deletingFileId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingFileId && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      )}
    </div>
  );
};

export default ProjectFilesSection;
