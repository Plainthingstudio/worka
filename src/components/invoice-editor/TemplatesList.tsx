
import React from "react";
import { PlusCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { InvoiceTemplate } from "@/types/template";
import TemplatePreview from "./TemplatePreview";

interface TemplatesListProps {
  templates: InvoiceTemplate[];
  activeTemplate: InvoiceTemplate;
  onSelectTemplate: (template: InvoiceTemplate) => void;
  onCreateTemplate: () => void;
}

const TemplatesList: React.FC<TemplatesListProps> = ({
  templates,
  activeTemplate,
  onSelectTemplate,
  onCreateTemplate
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Templates</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCreateTemplate}
          className="gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          New
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
          {templates.map((template) => (
            <TemplatePreview
              key={template.id}
              template={template}
              isActive={activeTemplate.id === template.id}
              onClick={() => onSelectTemplate(template)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TemplatesList;
