
import { v4 as uuidv4 } from 'uuid';
import { InvoiceTemplate, InvoiceTemplateStyle } from '@/types/template';
import { defaultTemplate, defaultTemplateStyle } from './constants';

export function createTemplate(
  templateData: Partial<InvoiceTemplate>,
  templates: InvoiceTemplate[]
): InvoiceTemplate {
  return {
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
}

export function updateTemplate(
  template: InvoiceTemplate,
  templateData: Partial<InvoiceTemplate>
): InvoiceTemplate {
  return {
    ...template,
    ...templateData,
    updatedAt: new Date(),
    style: {
      ...template.style,
      ...(templateData.style || {})
    }
  };
}

export function duplicateTemplate(template: InvoiceTemplate): InvoiceTemplate {
  return {
    ...template,
    id: uuidv4(),
    name: `${template.name} (Copy)`,
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
