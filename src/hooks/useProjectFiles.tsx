import { useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Models } from "appwrite";
import { toast } from "sonner";
import {
  account,
  client as appwriteClient,
  databases,
  DATABASE_ID,
  ID,
  Query,
  storage,
} from "@/integrations/appwrite/client";
import { ProjectFile } from "@/types";

const PROJECT_FILES_BUCKET = "project-files";
const PROJECT_FILES_COLLECTION = "project_files";
const MAX_PROJECT_FILE_SIZE = 50 * 1024 * 1024;

type ProjectFileDocument = Models.Document & {
  project_id: string;
  user_id: string;
  name: string;
  source_type: ProjectFile["sourceType"];
  file_id?: string;
  file_url?: string;
  file_size?: number;
  file_type?: string;
  external_url?: string;
};

export const projectFilesQueryKey = (projectId: string | undefined) =>
  ["projectFiles", projectId] as const;

const mapProjectFileDocument = (document: ProjectFileDocument): ProjectFile => ({
  id: document.$id,
  projectId: document.project_id,
  userId: document.user_id,
  name: document.name,
  sourceType: document.source_type,
  fileId: document.file_id || undefined,
  fileUrl: document.file_url || undefined,
  fileSize: document.file_size ?? undefined,
  fileType: document.file_type || undefined,
  externalUrl: document.external_url || undefined,
  createdAt: new Date(document.$createdAt),
  updatedAt: new Date(document.$updatedAt),
});

const parseProjectLinkUrl = (value: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return null;

  try {
    const url = new URL(/^[a-z][a-z\d+\-.]*:\/\//i.test(trimmedValue) ? trimmedValue : `https://${trimmedValue}`);

    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
};

const fetchProjectFiles = async (projectId: string): Promise<ProjectFile[]> => {
  const response = await databases.listDocuments(DATABASE_ID, PROJECT_FILES_COLLECTION, [
    Query.equal("project_id", projectId),
    Query.orderDesc("$createdAt"),
  ]);

  return response.documents.map(mapProjectFileDocument);
};

export const useProjectFiles = (projectId: string | undefined) => {
  const queryClient = useQueryClient();
  const queryKey = projectFilesQueryKey(projectId);

  const { data: files = [], isLoading, isFetching, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchProjectFiles(projectId!),
    enabled: Boolean(projectId),
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: projectFilesQueryKey(projectId) });
  }, [projectId, queryClient]);

  useEffect(() => {
    if (!projectId) return;

    const unsubscribe = appwriteClient.subscribe(
      [`databases.${DATABASE_ID}.collections.${PROJECT_FILES_COLLECTION}.documents`],
      () => invalidate()
    );

    return () => unsubscribe();
  }, [projectId, invalidate]);

  const uploadProjectFile = async (file: File) => {
    if (!projectId) return false;

    let uploadedFileId: string | null = null;

    try {
      if (file.size > MAX_PROJECT_FILE_SIZE) {
        toast.error("File is too large. Maximum size is 50MB.");
        return false;
      }

      const user = await account.get();
      const uploadedFile = await storage.createFile(PROJECT_FILES_BUCKET, ID.unique(), file);
      uploadedFileId = uploadedFile.$id;
      const fileUrl = storage.getFileView(PROJECT_FILES_BUCKET, uploadedFile.$id).toString();

      await databases.createDocument(DATABASE_ID, PROJECT_FILES_COLLECTION, ID.unique(), {
        project_id: projectId,
        user_id: user.$id,
        name: file.name,
        source_type: "upload",
        file_id: uploadedFile.$id,
        file_url: fileUrl,
        file_size: file.size,
        file_type: file.type || "application/octet-stream",
      });

      toast.success("File uploaded successfully");
      invalidate();
      return true;
    } catch (error) {
      if (uploadedFileId) {
        try {
          await storage.deleteFile(PROJECT_FILES_BUCKET, uploadedFileId);
        } catch (cleanupError) {
          console.error("Error cleaning up uploaded project file:", cleanupError);
        }
      }

      console.error("Error uploading project file:", error);
      toast.error("Failed to upload file");
      return false;
    }
  };

  const addProjectLink = async ({ name, url }: { name?: string; url: string }) => {
    if (!projectId) return false;

    try {
      const parsedUrl = parseProjectLinkUrl(url);

      if (!parsedUrl) {
        toast.error("Enter a valid web URL");
        return false;
      }

      const user = await account.get();

      await databases.createDocument(DATABASE_ID, PROJECT_FILES_COLLECTION, ID.unique(), {
        project_id: projectId,
        user_id: user.$id,
        name: name?.trim() || parsedUrl.hostname,
        source_type: "link",
        external_url: parsedUrl.toString(),
      });

      toast.success("Link added successfully");
      invalidate();
      return true;
    } catch (error) {
      console.error("Error adding project link:", error);
      toast.error("Failed to add link");
      return false;
    }
  };

  const deleteProjectFile = async (projectFile: ProjectFile) => {
    try {
      if (projectFile.sourceType === "upload" && projectFile.fileId) {
        try {
          await storage.deleteFile(PROJECT_FILES_BUCKET, projectFile.fileId);
        } catch (storageError) {
          console.error("Error deleting project file from storage:", storageError);
        }
      }

      await databases.deleteDocument(DATABASE_ID, PROJECT_FILES_COLLECTION, projectFile.id);
      toast.success(projectFile.sourceType === "link" ? "Link deleted" : "File deleted");
      invalidate();
      return true;
    } catch (error) {
      console.error("Error deleting project file:", error);
      toast.error("Failed to delete item");
      return false;
    }
  };

  return {
    files,
    isLoading,
    isFetching,
    refetch,
    uploadProjectFile,
    addProjectLink,
    deleteProjectFile,
  };
};
