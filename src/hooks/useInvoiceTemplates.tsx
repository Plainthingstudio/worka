import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { InvoiceTemplate, InvoiceTemplateStyle } from '@/types/template';
import { useToast } from '@/hooks/use-toast';

// Default template style
export const defaultTemplateStyle: InvoiceTemplateStyle = {
  fontFamily: 'helvetica',
  primaryColor: '#1A1F2C',
  secondaryColor: '#7E69AB',
  accentColor: '#9b87f5',
  logoPosition: 'left',
  borderStyle: 'solid',
  borderWidth: 1,
  borderColor: '#e2e8f0',
  showLogo: true,
  showSignature: false,
  headerStyle: 'standard',
  footerStyle: 'standard',
  tableStyle: 'standard'
};

// Default template
export const defaultTemplate: InvoiceTemplate = {
  id: 'default',
  name: 'Default Template',
  description: 'The default invoice template',
  isDefault: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  style: defaultTemplateStyle
};

interface InvoiceTemplatesContextType {
  templates: InvoiceTemplate[];
  activeTemplate: InvoiceTemplate;
  setActiveTemplate: (template: InvoiceTemplate) => void;
  saveTemplate: (template: Partial<InvoiceTemplate>) => InvoiceTemplate;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => InvoiceTemplate;
  updateTemplateName: (id: string, name: string) => void;
  updateTemplateStyle: (id: string, style: Partial<InvoiceTemplateStyle>) => void;
}

const InvoiceTemplatesContext = createContext<InvoiceTemplatesContextType | undefined>(undefined);

export const InvoiceTemplatesProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([defaultTemplate]);
  const [activeTemplate, setActiveTemplate] = useState<InvoiceTemplate>(defaultTemplate);

  // Load templates from localStorage on mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem('invoiceTemplates');
    const savedActiveTemplateId = localStorage.getItem('activeInvoiceTemplateId');
    
    if (savedTemplates) {
      try {
        const parsedTemplates = JSON.parse(savedTemplates);
        
        // Ensure the default template always exists
        if (!parsedTemplates.some((t: InvoiceTemplate) => t.id === 'default')) {
          parsedTemplates.push(defaultTemplate);
        }
        
        setTemplates(parsedTemplates);
        
        // Set active template
        if (savedActiveTemplateId) {
          const found = parsedTemplates.find((t: InvoiceTemplate) => t.id === savedActiveTemplateId);
          if (found) {
            setActiveTemplate(found);
          }
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        setTemplates([defaultTemplate]);
      }
    }
  }, []);

  // Save templates to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('invoiceTemplates', JSON.stringify(templates));
    localStorage.setItem('activeInvoiceTemplateId', activeTemplate.id);
  }, [templates, activeTemplate]);

  const saveTemplate = (templateData: Partial<InvoiceTemplate>): InvoiceTemplate => {
    const isUpdate = templateData.id && templates.some(t => t.id === templateData.id);
    
    let newTemplate: InvoiceTemplate;
    let updatedTemplates: InvoiceTemplate[];
    
    if (isUpdate) {
      updatedTemplates = templates.map(t => {
        if (t.id === templateData.id) {
          return {
            ...t,
            ...templateData,
            updatedAt: new Date(),
            style: {
              ...t.style,
              ...(templateData.style || {})
            }
          };
        }
        return t;
      });
      
      newTemplate = updatedTemplates.find(t => t.id === templateData.id) as InvoiceTemplate;
      
      toast({
        title: "Template Updated",
        description: `${newTemplate.name} has been updated.`
      });
    } else {
      newTemplate = {
        id: uuidv4(),
        name: templateData.name || `Template ${templates.length + 1}`,
        description: templateData.description || "Invoice template",
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        style: {
          ...defaultTemplateStyle,
          ...(templateData.style || {})
        }
      };
      
      updatedTemplates = [...templates, newTemplate];
      
      toast({
        title: "Template Created",
        description: `${newTemplate.name} has been created.`
      });
    }
    
    setTemplates(updatedTemplates);
    return newTemplate;
  };

  const deleteTemplate = (id: string) => {
    // Don't allow deleting the default template
    if (id === 'default') {
      toast({
        title: "Cannot Delete Default",
        description: "The default template cannot be deleted.",
        variant: "destructive"
      });
      return;
    }
    
    const templateToDelete = templates.find(t => t.id === id);
    if (!templateToDelete) return;
    
    const updatedTemplates = templates.filter(t => t.id !== id);
    setTemplates(updatedTemplates);
    
    // If the active template was deleted, set active to default
    if (activeTemplate.id === id) {
      const defaultTemplate = updatedTemplates.find(t => t.id === 'default') || updatedTemplates[0];
      setActiveTemplate(defaultTemplate);
    }
    
    toast({
      title: "Template Deleted",
      description: `${templateToDelete.name} has been deleted.`
    });
  };

  const duplicateTemplate = (id: string): InvoiceTemplate => {
    const templateToDuplicate = templates.find(t => t.id === id);
    if (!templateToDuplicate) {
      throw new Error(`Template with ID ${id} not found`);
    }
    
    const duplicatedTemplate: InvoiceTemplate = {
      ...templateToDuplicate,
      id: uuidv4(),
      name: `${templateToDuplicate.name} (Copy)`,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setTemplates([...templates, duplicatedTemplate]);
    
    toast({
      title: "Template Duplicated",
      description: `A copy of ${templateToDuplicate.name} has been created.`
    });
    
    return duplicatedTemplate;
  };

  const updateTemplateName = (id: string, name: string) => {
    setTemplates(
      templates.map(t => {
        if (t.id === id) {
          return { ...t, name, updatedAt: new Date() };
        }
        return t;
      })
    );
    
    // Update active template if it's the one being renamed
    if (activeTemplate.id === id) {
      setActiveTemplate(prev => ({ ...prev, name, updatedAt: new Date() }));
    }
  };

  const updateTemplateStyle = (id: string, style: Partial<InvoiceTemplateStyle>) => {
    setTemplates(
      templates.map(t => {
        if (t.id === id) {
          return { 
            ...t, 
            style: { ...t.style, ...style },
            updatedAt: new Date() 
          };
        }
        return t;
      })
    );
    
    // Update active template if it's the one being styled
    if (activeTemplate.id === id) {
      setActiveTemplate(prev => ({ 
        ...prev, 
        style: { ...prev.style, ...style },
        updatedAt: new Date() 
      }));
    }
  };

  return (
    <InvoiceTemplatesContext.Provider 
      value={{
        templates,
        activeTemplate,
        setActiveTemplate,
        saveTemplate,
        deleteTemplate,
        duplicateTemplate,
        updateTemplateName,
        updateTemplateStyle
      }}
    >
      {children}
    </InvoiceTemplatesContext.Provider>
  );
};

export const useInvoiceTemplates = () => {
  const context = useContext(InvoiceTemplatesContext);
  if (context === undefined) {
    throw new Error('useInvoiceTemplates must be used within an InvoiceTemplatesProvider');
  }
  return context;
};
