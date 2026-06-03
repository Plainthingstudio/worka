import { storage } from "@/integrations/appwrite/client";

export const PROFILE_AVATARS_BUCKET = "profile-avatars";
export const PROFILE_AVATAR_MAX_SIZE = 5 * 1024 * 1024;
export const PROFILE_AVATAR_ACCEPT = "image/jpeg,image/png,image/webp";
export const PROFILE_AVATAR_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const getAvatarUrl = (
  fileId?: string | null,
  cacheKey?: string | Date | null
) => {
  if (!fileId) return undefined;

  const url = storage.getFileView(PROFILE_AVATARS_BUCKET, fileId).toString();
  if (!cacheKey) return url;

  const version =
    cacheKey instanceof Date ? cacheKey.toISOString() : String(cacheKey);
  const separator = url.includes("?") ? "&" : "?";

  return `${url}${separator}v=${encodeURIComponent(version)}`;
};

export const validateProfileAvatarFile = (file: File) => {
  if (!PROFILE_AVATAR_ALLOWED_TYPES.includes(file.type)) {
    return "Please upload a JPG, PNG, or WEBP image.";
  }

  if (file.size > PROFILE_AVATAR_MAX_SIZE) {
    return "Avatar must be 5MB or smaller.";
  }

  return null;
};
