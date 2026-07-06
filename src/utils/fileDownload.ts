export const downloadFileFromUrl = async (fileUrl: string, fileName: string) => {
  const link = document.createElement("a");

  link.href = fileUrl;
  link.download = fileName || "download";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
};
