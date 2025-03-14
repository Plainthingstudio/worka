
import jsPDF from "jspdf";
import { addSectionTitle, addField, checkPageOverflow } from "../../pdfUtils";

/**
 * Renders the services required section of the PDF
 */
export const renderServicesRequired = (doc: jsPDF, brief: any, y: number): number => {
  // Services Required
  const services = brief.services;
  if (services && Array.isArray(services) && services.length > 0) {
    y = addSectionTitle(doc, "Services Required", y);
    y = addField(doc, "Services", services.join(", "), y);
    y = checkPageOverflow(doc, y);
  }

  // Print Media
  const printMedia = brief.printMedia || brief.print_media;
  if (printMedia && Array.isArray(printMedia) && printMedia.length > 0) {
    y = addSectionTitle(doc, "Print Media", y);
    y = addField(doc, "Print Media Items", printMedia.join(", "), y);
    y = checkPageOverflow(doc, y);
  }

  // Digital Media
  const digitalMedia = brief.digitalMedia || brief.digital_media;
  if (digitalMedia && Array.isArray(digitalMedia) && digitalMedia.length > 0) {
    y = addSectionTitle(doc, "Digital Media", y);
    y = addField(doc, "Digital Media Items", digitalMedia.join(", "), y);
    y = checkPageOverflow(doc, y);
  }
  
  return y;
};
