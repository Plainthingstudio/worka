
import html2pdf from 'html2pdf.js';
import { format } from 'date-fns';
import { generateUIDesignBriefHtml } from './html/uiDesignBriefHtml';
import { generateIllustrationBriefHtml } from './html/illustrationBriefHtml';
import { generateGraphicDesignBriefHtml } from './html/graphicDesignBriefHtml';

/**
 * Generates a PDF document from a brief using html2pdf.js
 */
export const generateBriefPDF = async (briefData: any): Promise<void> => {
  try {
    console.log("Generating brief PDF with html2pdf.js:", briefData);
    
    // Determine the brief type and use the appropriate HTML generator
    let html = '';
    let fileNamePrefix = '';
    
    if (briefData.type === "UI Design") {
      html = generateUIDesignBriefHtml(briefData);
      fileNamePrefix = 'UI_Design_Brief';
    } else if (briefData.type === "Illustration Design" || briefData.type === "Illustrations") {
      html = generateIllustrationBriefHtml(briefData);
      fileNamePrefix = 'Illustration_Brief';
    } else if (briefData.type === "Graphic Design") {
      html = generateGraphicDesignBriefHtml(briefData);
      fileNamePrefix = 'Graphic_Design_Brief';
    } else {
      throw new Error(`Unsupported brief type: ${briefData.type}`);
    }
    
    // Create a temporary element to hold the HTML content
    const element = document.createElement('div');
    element.innerHTML = html;
    
    // Get the first child element (should be the HTML content)
    const contentElement = element.firstElementChild;
    
    // Append to document body (required for proper rendering)
    if (contentElement) {
      document.body.appendChild(contentElement);
    } else {
      throw new Error('Failed to create brief element');
    }
    
    try {
      // Get company name for the filename
      const companyName = briefData.companyName || briefData.company_name || 'brief';
      const sanitizedCompanyName = companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      
      // Options for html2pdf - Use A4 paper size with proper margins
      const options = {
        margin: 10, // Add margin for better readability
        filename: `${fileNamePrefix}_${sanitizedCompanyName}_${format(new Date(), 'yyyy-MM-dd')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, // Higher scale for better quality
          useCORS: true,
          logging: false,
          backgroundColor: null
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', // A4 paper size
          orientation: 'portrait',
          compress: true,
          putOnlyUsedFonts: true,
          precision: 16 // Higher precision for better text rendering
        }
      };
      
      // Generate PDF using html2pdf.js
      await html2pdf()
        .from(contentElement)
        .set(options)
        .save();
      
      console.log("PDF generation completed successfully");
    } finally {
      // Clean up - always remove the element from DOM
      if (contentElement && contentElement.parentNode) {
        contentElement.parentNode.removeChild(contentElement);
      }
    }
  } catch (error) {
    console.error("Error generating brief PDF:", error);
    throw error;
  }
};
