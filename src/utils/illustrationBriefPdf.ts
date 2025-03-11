import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format, isValid, parseISO } from 'date-fns';
import { addLogoToDocument } from './pdfHelpers';

// Function to add a table to the document
const addTableToDocument = (doc: jsPDF, headers: string[], data: string[][], startY: number): number => {
  (doc as any).autoTable({
    head: [headers],
    body: data,
    startY: startY,
    theme: 'striped',
    headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { overflow: 'linebreak', fontSize: 10 },
    columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 'auto' } },
  });

  // @ts-ignore
  const finalY = doc.lastAutoTable.finalY || startY;
  return finalY + 10;
};

// Fix the getIllustrationDetails function to handle the array/object properly
export const generateIllustrationBriefPDF = async (briefData: any): Promise<void> => {
  try {
    console.log("Generating illustration brief PDF with data:", briefData);
    
    // Create a new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add logo and header
    await addLogoToDocument(doc);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Illustration Design Brief", pageWidth / 2, 30, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    // Helper function to safely get values (handles both camelCase and snake_case)
    const getValue = (camelCaseKey: string, snakeCaseKey: string, defaultValue = "Not provided") => {
      const value = briefData[camelCaseKey] !== undefined 
        ? briefData[camelCaseKey] 
        : briefData[snakeCaseKey] !== undefined 
          ? briefData[snakeCaseKey] 
          : defaultValue;
          
      // Check if value is null, undefined, empty string, or empty array
      if (value === null || value === undefined || value === "" || 
          (Array.isArray(value) && value.length === 0)) {
        return defaultValue;
      }
      
      return value;
    };
    
    // Helper to safely format dates
    const formatDate = (dateValue: any): string => {
      if (!dateValue) return "Not provided";
      
      try {
        let dateObj;
        
        if (typeof dateValue === 'string') {
          dateObj = parseISO(dateValue);
        } else {
          dateObj = new Date(dateValue);
        }
        
        if (isValid(dateObj)) {
          return format(dateObj, "MMMM d, yyyy");
        }
        return "Invalid date";
      } catch (error) {
        console.error("Error formatting date:", error);
        return "Not provided";
      }
    };
    
    // Helper to handle illustration details which could be an array or object
    const getIllustrationDetails = () => {
      const details = getValue("illustrationDetails", "illustration_details", []);
      return Array.isArray(details) ? details : 
             details && typeof details === 'object' ? [details] : [];
    };

    // Helper to process the details to a string
    const processDetailsToString = (details: any[]): string => {
      if (!details || details.length === 0) return "Not provided";
      
      try {
        return details.map(detail => {
          if (typeof detail === 'string') return detail;
          return JSON.stringify(detail);
        }).join(", ");
      } catch (error) {
        console.error("Error processing details:", error);
        return "Error processing details";
      }
    };
    
    // Client information section
    doc.setFont("helvetica", "bold");
    doc.text("Client Information", 20, 45);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${getValue("name", "name")}`, 20, 52);
    doc.text(`Email: ${getValue("email", "email")}`, 20, 59);
    doc.text(`Company: ${getValue("companyName", "company_name")}`, 20, 66);
    if (getValue("phone", "phone") !== "Not provided") {
      doc.text(`Phone: ${getValue("phone", "phone")}`, 20, 73);
    }
    
    let currentY = 85; // Start position after client information
    
    // Submission details
    doc.setFont("helvetica", "bold");
    doc.text("Submission Details", 20, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(`Submitted: ${formatDate(getValue("submissionDate", "submission_date"))}`, 20, currentY + 7);
    doc.text(`Status: ${getValue("status", "status")}`, 20, currentY + 14);
    currentY += 26;
    
    // Function to add text with dynamic line breaks
    const addTextWithLineBreaks = (text: string, x: number, y: number, maxWidth: number): number => {
      const words = text.split(' ');
      let line = '';
      let currentYPos = y;
    
      words.forEach(word => {
        const testLine = line + word + ' ';
        const textWidth = doc.getTextWidth(testLine);
    
        if (textWidth > maxWidth && line.length > 0) {
          doc.text(line, x, currentYPos);
          line = word + ' ';
          currentYPos += 7;
        } else {
          line = testLine;
        }
      });
    
      doc.text(line, x, currentYPos);
      return currentYPos;
    };
    
    // Add brief details
    const addBriefDetailSection = (title: string, content: string) => {
      if (content && content !== "Not provided") {
        doc.setFont("helvetica", "bold");
        doc.text(title, 20, currentY);
        doc.setFont("helvetica", "normal");
        currentY = addTextWithLineBreaks(content, 20, currentY + 7, pageWidth - 40) + 10;
      }
    };
    
    addBriefDetailSection("About Company", getValue("aboutCompany", "about_company"));
    addBriefDetailSection("Illustrations Purpose", getValue("illustrationsPurpose", "illustrations_purpose"));
    addBriefDetailSection("Illustrations For", getValue("illustrationsFor", "illustrations_for"));
    addBriefDetailSection("Illustrations Style", getValue("illustrationsStyle", "illustrations_style"));
    addBriefDetailSection("Target Audience", getValue("targetAudience", "target_audience"));
    addBriefDetailSection("Brand Guidelines", getValue("brandGuidelines", "brand_guidelines"));
    addBriefDetailSection("General Style", getValue("generalStyle", "general_style"));
    addBriefDetailSection("Color Preferences", getValue("colorPreferences", "color_preferences"));
    addBriefDetailSection("Likes/Dislikes in Design", getValue("likeDislikeDesign", "like_dislike_design"));
    addBriefDetailSection("Number of Illustrations", String(getValue("illustrationsCount", "illustrations_count")));
    
    // Handle deliverables which could be a string or array
    const deliverables = getValue("deliverables", "deliverables");
    const deliverablesStr = Array.isArray(deliverables) 
      ? deliverables.join(", ") 
      : typeof deliverables === 'string' 
        ? deliverables 
        : "Not provided";
    
    addBriefDetailSection("File Formats", deliverablesStr);
    
    // Competitors Table
    const competitorsHeaders = ["Competitor", "Details"];
    let competitorsData: string[][] = [];
    for (let i = 1; i <= 4; i++) {
      const competitor = getValue(`competitor${i}`, `competitor${i}`);
      if (competitor !== "Not provided") {
        competitorsData.push([`Competitor ${i}`, competitor]);
      }
    }
    if (competitorsData.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Competitors", 20, currentY);
      doc.setFont("helvetica", "normal");
      currentY = addTableToDocument(doc, competitorsHeaders, competitorsData, currentY + 7);
    }
    
    // Design References Table
    const referencesHeaders = ["Reference", "Details"];
    let referencesData: string[][] = [];
    for (let i = 1; i <= 4; i++) {
      const reference = getValue(`reference${i}`, `reference${i}`);
      if (reference !== "Not provided") {
        referencesData.push([`Reference ${i}`, reference]);
      }
    }
    if (referencesData.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Design References", 20, currentY);
      doc.setFont("helvetica", "normal");
      currentY = addTableToDocument(doc, referencesHeaders, referencesData, currentY + 7);
    }
    
    // Illustration Details Section
    const illustrationDetails = getIllustrationDetails();
    if (illustrationDetails.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Illustration Details", 20, currentY);
      doc.setFont("helvetica", "normal");
      currentY += 7;
    
      illustrationDetails.forEach((detail, index) => {
        const detailStr = typeof detail === 'string' ? detail : JSON.stringify(detail, null, 2);
        doc.setFont("helvetica", "bold");
        doc.text(`Illustration ${index + 1}:`, 20, currentY);
        doc.setFont("helvetica", "normal");
        currentY = addTextWithLineBreaks(detailStr, 20, currentY + 7, pageWidth - 40) + 10;
      });
    }
    
    // Completion Deadline
    const completionDeadline = formatDate(getValue("completionDeadline", "completion_deadline"));
    if (completionDeadline !== "Not provided") {
      doc.setFont("helvetica", "bold");
      doc.text("Completion Deadline", 20, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(completionDeadline, 20, currentY + 7);
      currentY += 15;
    }

    // Save the PDF
    doc.save(`IllustrationBrief-${getValue("companyName", "company_name")}.pdf`);
  } catch (error) {
    console.error("Error generating illustration brief PDF:", error);
    throw error;
  }
};
