
import { format, isValid, parseISO } from 'date-fns';

export const getValue = (
  briefData: any,
  camelCaseKey: string,
  snakeCaseKey: string,
  defaultValue = "Not provided"
): any => {
  if (!briefData) return defaultValue;
  
  const value = briefData[camelCaseKey] !== undefined 
    ? briefData[camelCaseKey] 
    : briefData[snakeCaseKey] !== undefined 
      ? briefData[snakeCaseKey] 
      : defaultValue;
      
  if (value === null || value === undefined || value === "" || 
      (Array.isArray(value) && value.length === 0)) {
    return defaultValue;
  }
  
  return value;
};

export const formatDate = (dateValue: any): string => {
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

export const getWebsiteTypeInterest = (briefData: any): string => {
  const interestObj = getValue(briefData, "websiteTypeInterest", "website_type_interest", {});
  
  if (typeof interestObj === 'string') return interestObj;
  
  if (Array.isArray(interestObj)) {
    return interestObj.join(", ");
  }
  
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
      .filter(([_, isSelected]) => isSelected === true)
      .map(([key, _]) => websiteTypes[key] || key);
    
    return selectedTypes.length > 0 ? selectedTypes.join(", ") : "Not provided";
  }
  
  return "Not provided";
};

export const getPageDetails = (briefData: any) => {
  const details = getValue(briefData, "pageDetails", "page_details", []);
  return Array.isArray(details) ? details : 
         details && typeof details === 'object' ? [details] : [];
};
