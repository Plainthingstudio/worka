import { client, storage } from "@/integrations/appwrite/client";

export const isPreviewableFile = (fileType?: string) => {
  const normalizedType = (fileType || "").toLowerCase();
  return normalizedType.startsWith("image/") || normalizedType.includes("pdf");
};

export const extractAppwriteFileId = (fileUrl?: string) => {
  if (!fileUrl) return undefined;

  try {
    const url = new URL(fileUrl);
    const match = url.pathname.match(/\/storage\/buckets\/[^/]+\/files\/([^/]+)/);
    return match?.[1] ? decodeURIComponent(match[1]) : undefined;
  } catch {
    const match = fileUrl.match(/\/storage\/buckets\/[^/]+\/files\/([^/?#]+)/);
    return match?.[1] ? decodeURIComponent(match[1]) : undefined;
  }
};

export const getAppwritePreviewUrl = ({
  bucketId,
  fileId,
  fileType,
  fallbackUrl,
}: {
  bucketId?: string;
  fileId?: string;
  fileType?: string;
  fallbackUrl: string;
}) => {
  if (!bucketId || !fileId) return fallbackUrl;

  return storage.getFileView(bucketId, fileId).toString();
};

export const getAppwriteDownloadUrl = ({
  bucketId,
  fileId,
  fallbackUrl,
}: {
  bucketId?: string;
  fileId?: string;
  fallbackUrl: string;
}) => {
  if (!bucketId || !fileId) return fallbackUrl;
  return storage.getFileDownload(bucketId, fileId).toString();
};

export const fetchAuthenticatedAppwriteFileBlob = async ({
  bucketId,
  fileId,
  fileType,
}: {
  bucketId: string;
  fileId: string;
  fileType?: string;
}) => {
  const apiPath = `/storage/buckets/${encodeURIComponent(bucketId)}/files/${encodeURIComponent(fileId)}/view`;
  const arrayBuffer = await client.call(
    "GET",
    new URL(client.config.endpoint + apiPath),
    {},
    {},
    "arrayBuffer"
  );

  return new Blob([arrayBuffer], { type: fileType || "application/octet-stream" });
};
