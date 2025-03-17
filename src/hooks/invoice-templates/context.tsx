
import { createContext, ReactNode, useContext } from 'react';
import { InvoiceTemplate, InvoiceTemplateStyle } from '@/types/template';
import { defaultTemplate } from './constants';

export interface InvoiceTemplatesContextType {
  templates: InvoiceTemplate[];
  activeTemplate: InvoiceTemplate;
  setActiveTemplate: (template: InvoiceTemplate) => void;
  saveTemplate: (template: Partial<InvoiceTemplate>) => InvoiceTemplate;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => InvoiceTemplate;
  updateTemplateName: (id: string, name: string) => void;
  updateTemplateStyle: (id: string, style: Partial<InvoiceTemplateStyle>) => void;
}

export const InvoiceTemplatesContext = createContext<InvoiceTemplatesContextType | undefined>(undefined);

export const useInvoiceTemplates = () => {
  const context = useContext(InvoiceTemplatesContext);
  if (context === undefined) {
    throw new Error('useInvoiceTemplates must be used within an InvoiceTemplatesProvider');
  }
  return context;
};
