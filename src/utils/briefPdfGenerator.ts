
import jsPDF from 'jspdf';
import { format } from 'date-fns';

export const generateIllustrationBriefPDF = async (brief: any): Promise<void> => {
  try {
    // Initialize PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Document constants
    const pageWidth = 210;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Use helvetica font
    pdf.setFont("helvetica");
    
    // Add title
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("Illustration Design Brief", margin, margin);
    
    let currentY = margin + 20;
    
    // Contact Information
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Contact Information", margin, currentY);
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY + 1, margin + 60, currentY + 1);
    currentY += 10;
    
    // Name and Email
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Name:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.name || "N/A", margin + 40, currentY);
    currentY += 8;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Email:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.email || "N/A", margin + 40, currentY);
    currentY += 15;
    
    // Company Information
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Company Information", margin, currentY);
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY + 1, margin + 70, currentY + 1);
    currentY += 10;
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Company Name:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.companyName || "N/A", margin + 40, currentY);
    currentY += 8;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("About Company:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    const aboutTextLines = pdf.splitTextToSize(brief.aboutCompany || "N/A", contentWidth);
    pdf.text(aboutTextLines, margin, currentY);
    currentY += aboutTextLines.length * 5 + 5;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Illustrations Purpose:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    const purposeTextLines = pdf.splitTextToSize(brief.illustrationsPurpose || "N/A", contentWidth);
    pdf.text(purposeTextLines, margin, currentY);
    currentY += purposeTextLines.length * 5 + 5;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Illustrations For:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.illustrationsFor || "N/A", margin + 40, currentY);
    currentY += 8;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Illustrations Style:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.illustrationsStyle || "N/A", margin + 40, currentY);
    currentY += 15;
    
    // Check if we need a new page
    if (currentY > 250) {
      pdf.addPage();
      currentY = margin;
    }
    
    // Target Audience & Competitors
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Target Audience & Competitors", margin, currentY);
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY + 1, margin + 90, currentY + 1);
    currentY += 10;
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Target Audience:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    const audienceTextLines = pdf.splitTextToSize(brief.targetAudience || "N/A", contentWidth);
    pdf.text(audienceTextLines, margin, currentY);
    currentY += audienceTextLines.length * 5 + 5;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Competitors:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    let competitors = "";
    if (brief.competitor1) competitors += brief.competitor1 + ", ";
    if (brief.competitor2) competitors += brief.competitor2 + ", ";
    if (brief.competitor3) competitors += brief.competitor3 + ", ";
    if (brief.competitor4) competitors += brief.competitor4;
    if (competitors.endsWith(", ")) competitors = competitors.slice(0, -2);
    if (!competitors) competitors = "N/A";
    
    const competitorsTextLines = pdf.splitTextToSize(competitors, contentWidth);
    pdf.text(competitorsTextLines, margin, currentY);
    currentY += competitorsTextLines.length * 5 + 15;
    
    // Check if we need a new page
    if (currentY > 250) {
      pdf.addPage();
      currentY = margin;
    }
    
    // Illustration Requirements
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Illustration Requirements", margin, currentY);
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY + 1, margin + 80, currentY + 1);
    currentY += 10;
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Number of Illustrations:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.illustrationsCount?.toString() || "N/A", margin + 60, currentY);
    currentY += 10;
    
    // Print each illustration detail
    if (brief.illustrationDetails && brief.illustrationDetails.length > 0) {
      brief.illustrationDetails.forEach((detail: string, index: number) => {
        if (detail && detail.trim()) {
          pdf.setFont("helvetica", "bold");
          pdf.text(`Illustration ${index + 1}:`, margin, currentY);
          currentY += 8;
          pdf.setFont("helvetica", "normal");
          
          const detailLines = pdf.splitTextToSize(detail, contentWidth);
          pdf.text(detailLines, margin, currentY);
          currentY += detailLines.length * 5 + 5;
          
          // Check if we need a new page
          if (currentY > 250 && index < brief.illustrationDetails.length - 1) {
            pdf.addPage();
            currentY = margin;
          }
        }
      });
    }
    
    currentY += 5;
    
    // Check if we need a new page
    if (currentY > 230) {
      pdf.addPage();
      currentY = margin;
    }
    
    // Design Preferences
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Design Preferences", margin, currentY);
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY + 1, margin + 60, currentY + 1);
    currentY += 10;
    
    // Brand Guidelines
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Brand Guidelines:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    const guidelinesTextLines = pdf.splitTextToSize(brief.brandGuidelines || "N/A", contentWidth);
    pdf.text(guidelinesTextLines, margin, currentY);
    currentY += guidelinesTextLines.length * 5 + 5;
    
    // References
    pdf.setFont("helvetica", "bold");
    pdf.text("References:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    let references = "";
    if (brief.reference1) references += brief.reference1 + ", ";
    if (brief.reference2) references += brief.reference2 + ", ";
    if (brief.reference3) references += brief.reference3 + ", ";
    if (brief.reference4) references += brief.reference4;
    if (references.endsWith(", ")) references = references.slice(0, -2);
    if (!references) references = "N/A";
    
    const referencesTextLines = pdf.splitTextToSize(references, contentWidth);
    pdf.text(referencesTextLines, margin, currentY);
    currentY += referencesTextLines.length * 5 + 5;
    
    // General Style
    pdf.setFont("helvetica", "bold");
    pdf.text("General Style:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.generalStyle || "N/A", margin + 40, currentY);
    currentY += 8;
    
    // Color Preferences
    pdf.setFont("helvetica", "bold");
    pdf.text("Color Preferences:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.colorPreferences || "N/A", margin + 40, currentY);
    currentY += 8;
    
    // Like & Dislike Design
    pdf.setFont("helvetica", "bold");
    pdf.text("Like & Dislike Design:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    const likesTextLines = pdf.splitTextToSize(brief.likeDislikeDesign || "N/A", contentWidth);
    pdf.text(likesTextLines, margin, currentY);
    currentY += likesTextLines.length * 5 + 15;
    
    // Check if we need a new page
    if (currentY > 250) {
      pdf.addPage();
      currentY = margin;
    }
    
    // Project Scope
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Project Scope", margin, currentY);
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY + 1, margin + 40, currentY + 1);
    currentY += 10;
    
    // Deliverables
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Deliverables:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    
    if (brief.deliverables && brief.deliverables.length > 0) {
      pdf.text(brief.deliverables.join(", "), margin + 40, currentY);
    } else {
      pdf.text("N/A", margin + 40, currentY);
    }
    currentY += 8;
    
    // Completion Deadline
    pdf.setFont("helvetica", "bold");
    pdf.text("Completion Deadline:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    
    let deadlineText = "N/A";
    if (brief.completionDeadline) {
      try {
        deadlineText = format(new Date(brief.completionDeadline), "yyyy-MM-dd");
      } catch (e) {
        deadlineText = brief.completionDeadline;
      }
    }
    
    pdf.text(deadlineText, margin + 50, currentY);
    
    // Add page numbers
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin, 287, { align: "right" });
    }
    
    // Add the current date to the PDF
    const currentDate = format(new Date(), "yyyy-MM-dd");
    pdf.setPage(1);
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${currentDate}`, pageWidth - margin, margin - 5, { align: "right" });
    
    // Save the PDF
    pdf.save(`Illustration_Brief_${brief.companyName || 'Unnamed'}.pdf`);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating brief PDF:', error);
    return Promise.reject(error);
  }
};

export const generateUIDesignBriefPDF = async (brief: any): Promise<void> => {
  try {
    // Initialize PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Document constants
    const pageWidth = 210;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Use helvetica font
    pdf.setFont("helvetica");
    
    // Add title
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("UI Design Brief", margin, margin);
    
    let currentY = margin + 20;
    
    // Contact Information
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Contact Information", margin, currentY);
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY + 1, margin + 60, currentY + 1);
    currentY += 10;
    
    // Name and Email
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Name:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.name || "N/A", margin + 40, currentY);
    currentY += 8;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Email:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.email || "N/A", margin + 40, currentY);
    currentY += 15;
    
    // Company Information
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Company Information", margin, currentY);
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY + 1, margin + 70, currentY + 1);
    currentY += 10;
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Company Name:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.companyName || "N/A", margin + 40, currentY);
    currentY += 8;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("About Company:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    const aboutTextLines = pdf.splitTextToSize(brief.aboutCompany || "N/A", contentWidth);
    pdf.text(aboutTextLines, margin, currentY);
    currentY += aboutTextLines.length * 5 + 5;
    
    // Website Type Interest
    pdf.setFont("helvetica", "bold");
    pdf.text("Website Type Interest:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    let websiteTypes = "";
    if (brief.websiteTypeInterest && Array.isArray(brief.websiteTypeInterest)) {
      websiteTypes = brief.websiteTypeInterest.join(", ");
    } else {
      websiteTypes = "N/A";
    }
    
    const websiteTypesLines = pdf.splitTextToSize(websiteTypes, contentWidth);
    pdf.text(websiteTypesLines, margin, currentY);
    currentY += websiteTypesLines.length * 5 + 5;
    
    // Check if we need a new page
    if (currentY > 250) {
      pdf.addPage();
      currentY = margin;
    }
    
    // Current Website
    pdf.setFont("helvetica", "bold");
    pdf.text("Current Website:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.currentWebsite || "N/A", margin + 40, currentY);
    currentY += 15;
    
    // Competitors
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Competitors", margin, currentY);
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY + 1, margin + 40, currentY + 1);
    currentY += 10;
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    
    let competitors = "";
    if (brief.competitor1) competitors += brief.competitor1 + ", ";
    if (brief.competitor2) competitors += brief.competitor2 + ", ";
    if (brief.competitor3) competitors += brief.competitor3 + ", ";
    if (brief.competitor4) competitors += brief.competitor4;
    if (competitors.endsWith(", ")) competitors = competitors.slice(0, -2);
    if (!competitors) competitors = "N/A";
    
    const competitorsTextLines = pdf.splitTextToSize(competitors, contentWidth);
    pdf.text(competitorsTextLines, margin, currentY);
    currentY += competitorsTextLines.length * 5 + 15;
    
    // Target Audience & Website Purpose
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Target Audience & Purpose", margin, currentY);
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY + 1, margin + 80, currentY + 1);
    currentY += 10;
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Target Audience:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    const audienceTextLines = pdf.splitTextToSize(brief.targetAudience || "N/A", contentWidth);
    pdf.text(audienceTextLines, margin, currentY);
    currentY += audienceTextLines.length * 5 + 5;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Website Purpose:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    const purposeTextLines = pdf.splitTextToSize(brief.websitePurpose || "N/A", contentWidth);
    pdf.text(purposeTextLines, margin, currentY);
    currentY += purposeTextLines.length * 5 + 15;
    
    // Check if we need a new page
    if (currentY > 250) {
      pdf.addPage();
      currentY = margin;
    }
    
    // Design Preferences
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Design Preferences", margin, currentY);
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY + 1, margin + 60, currentY + 1);
    currentY += 10;
    
    // References
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("References:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    let references = "";
    if (brief.reference1) references += brief.reference1 + ", ";
    if (brief.reference2) references += brief.reference2 + ", ";
    if (brief.reference3) references += brief.reference3 + ", ";
    if (brief.reference4) references += brief.reference4;
    if (references.endsWith(", ")) references = references.slice(0, -2);
    if (!references) references = "N/A";
    
    const referencesTextLines = pdf.splitTextToSize(references, contentWidth);
    pdf.text(referencesTextLines, margin, currentY);
    currentY += referencesTextLines.length * 5 + 5;
    
    // General Style
    pdf.setFont("helvetica", "bold");
    pdf.text("General Style:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.generalStyle || "N/A", margin + 40, currentY);
    currentY += 8;
    
    // Color & Font Preferences
    pdf.setFont("helvetica", "bold");
    pdf.text("Color Preferences:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.colorPreferences || "N/A", margin + 40, currentY);
    currentY += 8;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Font Preferences:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.fontPreferences || "N/A", margin + 40, currentY);
    currentY += 8;
    
    // Brand Guidelines & Wireframe
    pdf.setFont("helvetica", "bold");
    pdf.text("Has Brand Guidelines:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.hasBrandGuidelines || "N/A", margin + 50, currentY);
    currentY += 8;
    
    if (brief.hasBrandGuidelines === "Yes" && brief.brandGuidelinesDetails) {
      pdf.setFont("helvetica", "bold");
      pdf.text("Brand Guidelines Details:", margin, currentY);
      currentY += 8;
      pdf.setFont("helvetica", "normal");
      
      const guidelinesDetailsLines = pdf.splitTextToSize(brief.brandGuidelinesDetails, contentWidth);
      pdf.text(guidelinesDetailsLines, margin, currentY);
      currentY += guidelinesDetailsLines.length * 5 + 5;
    }
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Has Wireframe:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.hasWireframe || "N/A", margin + 50, currentY);
    currentY += 8;
    
    if (brief.hasWireframe === "Yes" && brief.wireframeDetails) {
      pdf.setFont("helvetica", "bold");
      pdf.text("Wireframe Details:", margin, currentY);
      currentY += 8;
      pdf.setFont("helvetica", "normal");
      
      const wireframeDetailsLines = pdf.splitTextToSize(brief.wireframeDetails, contentWidth);
      pdf.text(wireframeDetailsLines, margin, currentY);
      currentY += wireframeDetailsLines.length * 5 + 5;
    }
    
    // Check if we need a new page
    if (currentY > 250) {
      pdf.addPage();
      currentY = margin;
    }
    
    // Project Scope
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Project Scope", margin, currentY);
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY + 1, margin + 40, currentY + 1);
    currentY += 10;
    
    // Page Count
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Page Count:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.pageCount?.toString() || "N/A", margin + 40, currentY);
    currentY += 10;
    
    // Print each page detail
    if (brief.pageDetails && brief.pageDetails.length > 0) {
      pdf.setFont("helvetica", "bold");
      pdf.text("Page Details:", margin, currentY);
      currentY += 8;
      pdf.setFont("helvetica", "normal");
      
      brief.pageDetails.forEach((detail: string, index: number) => {
        if (detail && detail.trim()) {
          pdf.setFont("helvetica", "bold");
          pdf.text(`Page ${index + 1}:`, margin, currentY);
          currentY += 6;
          pdf.setFont("helvetica", "normal");
          
          const detailLines = pdf.splitTextToSize(detail, contentWidth);
          pdf.text(detailLines, margin, currentY);
          currentY += detailLines.length * 5 + 5;
          
          // Check if we need a new page
          if (currentY > 250 && index < brief.pageDetails.length - 1) {
            pdf.addPage();
            currentY = margin;
          }
        }
      });
    }
    
    // Website Content
    pdf.setFont("helvetica", "bold");
    pdf.text("Website Content:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    const contentTextLines = pdf.splitTextToSize(brief.websiteContent || "N/A", contentWidth);
    pdf.text(contentTextLines, margin, currentY);
    currentY += contentTextLines.length * 5 + 5;
    
    // Development Service
    pdf.setFont("helvetica", "bold");
    pdf.text("Development Service:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.developmentService || "N/A", margin + 50, currentY);
    currentY += 8;
    
    // Completion Deadline
    pdf.setFont("helvetica", "bold");
    pdf.text("Completion Deadline:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    
    let deadlineText = "N/A";
    if (brief.completionDeadline) {
      try {
        deadlineText = format(new Date(brief.completionDeadline), "yyyy-MM-dd");
      } catch (e) {
        deadlineText = brief.completionDeadline;
      }
    }
    
    pdf.text(deadlineText, margin + 50, currentY);
    
    // Add page numbers
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin, 287, { align: "right" });
    }
    
    // Add the current date to the PDF
    const currentDate = format(new Date(), "yyyy-MM-dd");
    pdf.setPage(1);
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${currentDate}`, pageWidth - margin, margin - 5, { align: "right" });
    
    // Save the PDF
    pdf.save(`UI_Design_Brief_${brief.companyName || 'Unnamed'}.pdf`);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating UI brief PDF:', error);
    return Promise.reject(error);
  }
};

export const generateGraphicDesignBriefPDF = async (brief: any): Promise<void> => {
  try {
    // Initialize PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Document constants
    const pageWidth = 210;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Use helvetica font
    pdf.setFont("helvetica");
    
    // Add title
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("Graphic Design Brief", margin, margin);
    
    let currentY = margin + 20;
    
    // Contact Information
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Contact Information", margin, currentY);
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY + 1, margin + 60, currentY + 1);
    currentY += 10;
    
    // Name and Email
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Name:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.name || "N/A", margin + 40, currentY);
    currentY += 8;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Email:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.email || "N/A", margin + 40, currentY);
    currentY += 15;
    
    // Company Information
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Company Information", margin, currentY);
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY + 1, margin + 70, currentY + 1);
    currentY += 10;
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Company Name:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.companyName || "N/A", margin + 40, currentY);
    currentY += 8;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("About Company:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    const aboutTextLines = pdf.splitTextToSize(brief.aboutCompany || "N/A", contentWidth);
    pdf.text(aboutTextLines, margin, currentY);
    currentY += aboutTextLines.length * 5 + 5;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Vision & Mission:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    const visionTextLines = pdf.splitTextToSize(brief.visionMission || "N/A", contentWidth);
    pdf.text(visionTextLines, margin, currentY);
    currentY += visionTextLines.length * 5 + 5;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Slogan/Tagline:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.slogan || "N/A", margin + 40, currentY);
    currentY += 15;
    
    // Check if we need a new page
    if (currentY > 250) {
      pdf.addPage();
      currentY = margin;
    }
    
    // Logo Feelings
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Logo Preferences", margin, currentY);
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY + 1, margin + 50, currentY + 1);
    currentY += 10;
    
    if (brief.logoFeelings) {
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Style:", margin, currentY);
      pdf.setFont("helvetica", "normal");
      pdf.text(brief.logoFeelings.style || "N/A", margin + 40, currentY);
      currentY += 8;
      
      pdf.setFont("helvetica", "bold");
      pdf.text("Pricing:", margin, currentY);
      pdf.setFont("helvetica", "normal");
      pdf.text(brief.logoFeelings.pricing || "N/A", margin + 40, currentY);
      currentY += 8;
      
      pdf.setFont("helvetica", "bold");
      pdf.text("Era:", margin, currentY);
      pdf.setFont("helvetica", "normal");
      pdf.text(brief.logoFeelings.era || "N/A", margin + 40, currentY);
      currentY += 8;
      
      pdf.setFont("helvetica", "bold");
      pdf.text("Tone:", margin, currentY);
      pdf.setFont("helvetica", "normal");
      pdf.text(brief.logoFeelings.tone || "N/A", margin + 40, currentY);
      currentY += 8;
      
      pdf.setFont("helvetica", "bold");
      pdf.text("Complexity:", margin, currentY);
      pdf.setFont("helvetica", "normal");
      pdf.text(brief.logoFeelings.complexity || "N/A", margin + 40, currentY);
      currentY += 8;
      
      pdf.setFont("helvetica", "bold");
      pdf.text("Gender:", margin, currentY);
      pdf.setFont("helvetica", "normal");
      pdf.text(brief.logoFeelings.gender || "N/A", margin + 40, currentY);
      currentY += 15;
    }
    
    // Tone
    pdf.setFont("helvetica", "bold");
    pdf.text("Brand Tone:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    let toneText = "";
    if (brief.tone && Array.isArray(brief.tone)) {
      toneText = brief.tone.join(", ");
    } else {
      toneText = "N/A";
    }
    
    const toneTextLines = pdf.splitTextToSize(toneText, contentWidth);
    pdf.text(toneTextLines, margin, currentY);
    currentY += toneTextLines.length * 5 + 5;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Logo Type:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.logoType || "N/A", margin + 40, currentY);
    currentY += 8;
    
    // Check if we need a new page
    if (currentY > 250) {
      pdf.addPage();
      currentY = margin;
    }
    
    // References
    pdf.setFont("helvetica", "bold");
    pdf.text("References:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    let references = "";
    if (brief.reference1) references += brief.reference1 + ", ";
    if (brief.reference2) references += brief.reference2 + ", ";
    if (brief.reference3) references += brief.reference3 + ", ";
    if (brief.reference4) references += brief.reference4;
    if (references.endsWith(", ")) references = references.slice(0, -2);
    if (!references) references = "N/A";
    
    const referencesTextLines = pdf.splitTextToSize(references, contentWidth);
    pdf.text(referencesTextLines, margin, currentY);
    currentY += referencesTextLines.length * 5 + 15;
    
    // Target Audience
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Target Audience", margin, currentY);
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY + 1, margin + 45, currentY + 1);
    currentY += 10;
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Target Age:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.targetAge || "N/A", margin + 40, currentY);
    currentY += 8;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Target Gender:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.targetGender || "N/A", margin + 40, currentY);
    currentY += 8;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Target Demography:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.targetDemography || "N/A", margin + 40, currentY);
    currentY += 8;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Target Profession:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.targetProfession || "N/A", margin + 40, currentY);
    currentY += 8;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Target Personality:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.targetPersonality || "N/A", margin + 40, currentY);
    currentY += 15;
    
    // Check if we need a new page
    if (currentY > 250) {
      pdf.addPage();
      currentY = margin;
    }
    
    // Market Information
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Market Information", margin, currentY);
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY + 1, margin + 50, currentY + 1);
    currentY += 10;
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Products/Services:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    const productsTextLines = pdf.splitTextToSize(brief.productsServices || "N/A", contentWidth);
    pdf.text(productsTextLines, margin, currentY);
    currentY += productsTextLines.length * 5 + 5;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Features & Benefits:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    const featuresTextLines = pdf.splitTextToSize(brief.featuresAndBenefits || "N/A", contentWidth);
    pdf.text(featuresTextLines, margin, currentY);
    currentY += featuresTextLines.length * 5 + 5;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Market Category:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(brief.marketCategory || "N/A", margin + 40, currentY);
    currentY += 8;
    
    // Competitors
    pdf.setFont("helvetica", "bold");
    pdf.text("Competitors:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    let competitors = "";
    if (brief.competitor1) competitors += brief.competitor1 + ", ";
    if (brief.competitor2) competitors += brief.competitor2 + ", ";
    if (brief.competitor3) competitors += brief.competitor3 + ", ";
    if (brief.competitor4) competitors += brief.competitor4;
    if (competitors.endsWith(", ")) competitors = competitors.slice(0, -2);
    if (!competitors) competitors = "N/A";
    
    const competitorsTextLines = pdf.splitTextToSize(competitors, contentWidth);
    pdf.text(competitorsTextLines, margin, currentY);
    currentY += competitorsTextLines.length * 5 + 5;
    
    // Check if we need a new page
    if (currentY > 250) {
      pdf.addPage();
      currentY = margin;
    }
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Brand Positioning:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    const positioningTextLines = pdf.splitTextToSize(brief.brandPositioning || "N/A", contentWidth);
    pdf.text(positioningTextLines, margin, currentY);
    currentY += positioningTextLines.length * 5 + 5;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Barrier to Entry:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    const barrierTextLines = pdf.splitTextToSize(brief.barrierToEntry || "N/A", contentWidth);
    pdf.text(barrierTextLines, margin, currentY);
    currentY += barrierTextLines.length * 5 + 5;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Specific Imagery:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    const imageryTextLines = pdf.splitTextToSize(brief.specificImagery || "N/A", contentWidth);
    pdf.text(imageryTextLines, margin, currentY);
    currentY += imageryTextLines.length * 5 + 15;
    
    // Check if we need a new page
    if (currentY > 250) {
      pdf.addPage();
      currentY = margin;
    }
    
    // Services & Deliverables
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Services & Deliverables", margin, currentY);
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY + 1, margin + 65, currentY + 1);
    currentY += 10;
    
    // Services requested
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Services Requested:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    let services = "";
    if (brief.services && Array.isArray(brief.services)) {
      services = brief.services.join(", ");
    } else {
      services = "N/A";
    }
    
    const servicesTextLines = pdf.splitTextToSize(services, contentWidth);
    pdf.text(servicesTextLines, margin, currentY);
    currentY += servicesTextLines.length * 5 + 5;
    
    // Print Media
    pdf.setFont("helvetica", "bold");
    pdf.text("Print Media:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    let printMedia = "";
    if (brief.printMedia && Array.isArray(brief.printMedia)) {
      printMedia = brief.printMedia.join(", ");
    } else {
      printMedia = "N/A";
    }
    
    const printMediaTextLines = pdf.splitTextToSize(printMedia, contentWidth);
    pdf.text(printMediaTextLines, margin, currentY);
    currentY += printMediaTextLines.length * 5 + 5;
    
    // Digital Media
    pdf.setFont("helvetica", "bold");
    pdf.text("Digital Media:", margin, currentY);
    currentY += 8;
    pdf.setFont("helvetica", "normal");
    
    let digitalMedia = "";
    if (brief.digitalMedia && Array.isArray(brief.digitalMedia)) {
      digitalMedia = brief.digitalMedia.join(", ");
    } else {
      digitalMedia = "N/A";
    }
    
    const digitalMediaTextLines = pdf.splitTextToSize(digitalMedia, contentWidth);
    pdf.text(digitalMediaTextLines, margin, currentY);
    currentY += digitalMediaTextLines.length * 5 + 5;
    
    // Add page numbers
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin, 287, { align: "right" });
    }
    
    // Add the current date to the PDF
    const currentDate = format(new Date(), "yyyy-MM-dd");
    pdf.setPage(1);
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${currentDate}`, pageWidth - margin, margin - 5, { align: "right" });
    
    // Save the PDF
    pdf.save(`Graphic_Design_Brief_${brief.companyName || 'Unnamed'}.pdf`);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating graphic brief PDF:', error);
    return Promise.reject(error);
  }
};
