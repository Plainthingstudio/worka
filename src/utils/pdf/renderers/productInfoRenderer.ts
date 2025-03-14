
import jsPDF from "jspdf";
import { addSectionTitle, checkPageOverflow, addMultiParagraphField } from "../../pdfUtils";

/**
 * Renders the product information section of the PDF
 */
export const renderProductInformation = (doc: jsPDF, brief: any, y: number): number => {
  y = addSectionTitle(doc, "Product Information", y);
  if (brief.productsServices || brief.products_services) {
    y = addMultiParagraphField(doc, "Products/Services", brief.productsServices || brief.products_services, y);
    y = checkPageOverflow(doc, y);
  }
  if (brief.featuresAndBenefits || brief.features_and_benefits) {
    y = addMultiParagraphField(doc, "Features & Benefits", brief.featuresAndBenefits || brief.features_and_benefits, y);
    y = checkPageOverflow(doc, y);
  }
  if (brief.marketCategory || brief.market_category) {
    y = addMultiParagraphField(doc, "Market Category", brief.marketCategory || brief.market_category, y);
    y = checkPageOverflow(doc, y);
  }
  
  return y;
};
