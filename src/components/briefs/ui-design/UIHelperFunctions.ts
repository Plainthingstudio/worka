
import { format, isValid, parseISO } from 'date-fns';

export const getValue = (
  briefData: any,
  camelCaseKey: string,
  snakeCaseKey: string,
  defaultValue: any = "Not provided"
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


export const getPageDetails = (briefData: any) => {
  const details = getValue(briefData, "pageDetails", "page_details", []);
  return Array.isArray(details) ? details : 
         details && typeof details === 'object' ? [details] : [];
};

// Helper to check if any competitor is provided
export const hasCompetitors = (briefData: any): boolean => {
  return Boolean(
    getValue(briefData, "competitor1", "competitor1", "") !== "Not provided" || 
    getValue(briefData, "competitor2", "competitor2", "") !== "Not provided" || 
    getValue(briefData, "competitor3", "competitor3", "") !== "Not provided" || 
    getValue(briefData, "competitor4", "competitor4", "") !== "Not provided"
  );
};

// Helper to check if any reference is provided
export const hasReferences = (briefData: any): boolean => {
  return Boolean(
    getValue(briefData, "reference1", "reference1", "") !== "Not provided" || 
    getValue(briefData, "reference2", "reference2", "") !== "Not provided" || 
    getValue(briefData, "reference3", "reference3", "") !== "Not provided" || 
    getValue(briefData, "reference4", "reference4", "") !== "Not provided"
  );
};
