
import { jsPDF } from "jspdf";
import logo from "../assets/logo.png";

export const addLogoToDocument = async (doc: jsPDF): Promise<void> => {
  try {
    const imgData = logo;
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.addImage(imgData, 'PNG', pageWidth / 2 - 25, 5, 50, 15);
  } catch (error) {
    console.error("Error adding logo to PDF:", error);
  }
};
