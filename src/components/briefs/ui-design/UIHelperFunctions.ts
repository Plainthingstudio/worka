
import { format, isValid, parseISO } from "date-fns";

// Helper function to safely format dates
export const formatDate = (dateValue: any): string => {
  if (!dateValue) return "Not provided";
  
  try {
    const dateObj = typeof dateValue === 'string' 
      ? parseISO(dateValue) 
      : new Date(dateValue);
    
    if (isValid(dateObj)) {
      return format(dateObj, "MMMM d, yyyy");
    }
    return "Invalid date";
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Not provided";
  }
};

// Helper function to handle both camelCase and snake_case field access
export const getValue = (briefDetails: any, camelCaseKey: string, snakeCaseKey: string, defaultValue = "Not provided") => {
  if (!briefDetails) return defaultValue;
  
  const value = briefDetails[camelCaseKey] !== undefined ? briefDetails[camelCaseKey] : 
               briefDetails[snakeCaseKey] !== undefined ? briefDetails[snakeCaseKey] : 
               defaultValue;
  
  // Check if value is null, undefined, empty string, or empty array
  if (value === null || value === undefined || value === "" || 
      (Array.isArray(value) && value.length === 0)) {
    return defaultValue;
  }
  
  return value;
};

// Helper function to get website type interest as a string of selected options only
export const getWebsiteTypeInterest = (briefDetails: any): string => {
  const interestObj = getValue(briefDetails, "websiteTypeInterest", "website_type_interest", {});
  
  // If it's already a string (for backward compatibility)
  if (typeof interestObj === 'string') return interestObj;
  
  // If it's an array, join the values
  if (Array.isArray(interestObj)) {
    return interestObj.join(", ");
  }
  
  // If it's an object with boolean values (checkbox selections)
  if (typeof interestObj === 'object' && interestObj !== null) {
    const websiteTypes: Record<string, string> = {
      agency: "Agency Website",
      portfolio: "Portfolio Website",
      finance: "Finance Website",
      saas: "SaaS Website",
      ecommerce: "E-commerce Website",
      web3: "Web3 Website",
      crypto: "Crypto Website",
      webapp: "Web Application",
      desktopapp: "Desktop Application",
      mobileapp: "Mobile Application",
      other: "Other"
    };
    
    const selectedTypes = Object.entries(interestObj)
      .filter(([_, isSelected]) => isSelected)
      .map(([key, _]) => websiteTypes[key] || key);
    
    return selectedTypes.length > 0 ? selectedTypes.join(", ") : "Not provided";
  }
  
  return "Not provided";
};

// Helper to check if any competitor is provided
export const hasCompetitors = (briefDetails: any): boolean => {
  return Boolean(
    getValue(briefDetails, "competitor1", "competitor1", "") !== "Not provided" || 
    getValue(briefDetails, "competitor2", "competitor2", "") !== "Not provided" || 
    getValue(briefDetails, "competitor3", "competitor3", "") !== "Not provided" || 
    getValue(briefDetails, "competitor4", "competitor4", "") !== "Not provided"
  );
};

// Helper to check if any reference is provided
export const hasReferences = (briefDetails: any): boolean => {
  return Boolean(
    getValue(briefDetails, "reference1", "reference1", "") !== "Not provided" || 
    getValue(briefDetails, "reference2", "reference2", "") !== "Not provided" || 
    getValue(briefDetails, "reference3", "reference3", "") !== "Not provided" || 
    getValue(briefDetails, "reference4", "reference4", "") !== "Not provided"
  );
};

// Helper to safely get page details
export const getPageDetails = (briefDetails: any): any[] => {
  const details = getValue(briefDetails, "pageDetails", "page_details", []);
  return Array.isArray(details) ? details : 
         details && typeof details === 'object' ? [details] : [];
};
