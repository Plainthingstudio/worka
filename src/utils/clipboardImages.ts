const getImageExtension = (mimeType: string) => {
  const subtype = mimeType.split("/")[1]?.toLowerCase() || "png";
  if (subtype === "jpeg") return "jpg";
  if (subtype === "svg+xml") return "svg";
  return subtype.replace(/[^a-z0-9]/g, "") || "png";
};

const getImageMimeTypeFromName = (name?: string) => {
  const extension = name?.split(".").pop()?.toLowerCase();
  if (!extension) return undefined;

  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "png") return "image/png";
  if (extension === "gif") return "image/gif";
  if (extension === "webp") return "image/webp";
  if (extension === "svg") return "image/svg+xml";
  return undefined;
};

const getTimestampName = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "-",
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
};

export const getClipboardImageFiles = (clipboardData: DataTransfer) => {
  const pastedAt = new Date();
  const timestamp = getTimestampName(pastedAt);
  const images: File[] = [];
  const seen = new Set<string>();

  const appendImage = (file: File, index: number, itemType?: string) => {
    const fileType = file.type || itemType || getImageMimeTypeFromName(file.name) || "";
    if (!fileType.startsWith("image/")) return;

    const key = `${fileType}:${file.size}`;
    if (seen.has(key)) return;
    seen.add(key);

    const existingName = file.name && file.name !== "image.png" ? file.name : "";
    const extension = getImageExtension(fileType || "image/png");
    const suffix = index > 0 ? `-${index + 1}` : "";
    const name = existingName || `pasted-image-${timestamp}${suffix}.${extension}`;

    images.push(
      new File([file], name, {
        type: fileType,
        lastModified: pastedAt.getTime(),
      })
    );
  };

  Array.from(clipboardData.files || []).forEach((file, index) => {
    appendImage(file, index);
  });

  Array.from(clipboardData.items || []).forEach((item, index) => {
    if (item.kind !== "file") return;

    const file = item.getAsFile();
    if (!file) return;

    appendImage(file, images.length + index, item.type);
  });

  return images;
};
