
import { useState, useEffect, ReactNode } from 'react';
import { InvoiceTemplate, InvoiceTemplateStyle } from '@/types/template';
import { useToast } from '@/hooks/use-toast';
import { InvoiceTemplatesContext } from './context';
import { defaultTemplate } from './constants';
import { createTemplate, updateTemplate, duplicateTemplate } from './templateOperations';

interface InvoiceTemplatesProviderProps {
  children: ReactNode;
}

export const InvoiceTemplatesProvider = ({ children }: InvoiceTemplatesProviderProps) => {
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
          return updateTemplate(t, templateData);
        }
        return t;
      });
      
      newTemplate = updatedTemplates.find(t => t.id === templateData.id) as InvoiceTemplate;
      
      toast({
        title: "Template Updated",
        description: `${newTemplate.name} has been updated.`
      });
    } else {
      newTemplate = createTemplate(templateData, templates);
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
      const defaultTemp = updatedTemplates.find(t => t.id === 'default') || updatedTemplates[0];
      setActiveTemplate(defaultTemp);
    }
    
    toast({
      title: "Template Deleted",
      description: `${templateToDelete.name} has been deleted.`
    });
  };

  const duplicateTemplateById = (id: string): InvoiceTemplate => {
    const templateToDuplicate = templates.find(t => t.id === id);
    if (!templateToDuplicate) {
      throw new Error(`Template with ID ${id} not found`);
    }
    
    const duplicatedTemplate = duplicateTemplate(templateToDuplicate);
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
        duplicateTemplate: duplicateTemplateById,
        updateTemplateName,
        updateTemplateStyle
      }}
    >
      {children}
    </InvoiceTemplatesContext.Provider>
  );
};
