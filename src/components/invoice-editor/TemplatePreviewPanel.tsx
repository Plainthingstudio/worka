
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { InvoiceTemplate } from '@/types/template';
import TemplatePreview from './TemplatePreview';

interface TemplatePreviewPanelProps {
  template: InvoiceTemplate;
  isApplied: boolean;
  onApplyTemplate: () => void;
}

const TemplatePreviewPanel: React.FC<TemplatePreviewPanelProps> = ({ 
  template, 
  isApplied, 
  onApplyTemplate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<InvoiceTemplate>(template);

  // When the template prop changes, update the current template
  React.useEffect(() => {
    setCurrentTemplate(template);
  }, [template]);

  const handleElementPositionChange = (elementId: string, position: { x: number; y: number }) => {
    setCurrentTemplate(prev => {
      const updatedElements = {
        ...(prev.style.elements || {}),
        [elementId]: position
      };

      return {
        ...prev,
        style: {
          ...prev.style,
          elements: updatedElements
        }
      };
    });
  };

  const handleSaveLayout = () => {
    // This would typically save back to the parent component
    // For simplicity, we're just toggling the edit mode
    setIsEditing(false);
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">{template.name}</h3>
          <p className="text-sm text-muted-foreground">{template.description}</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <Button 
              variant="default" 
              onClick={handleSaveLayout}
            >
              Save Layout
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(true)}
            >
              Edit Layout
            </Button>
          )}
          
          <Button
            variant={isApplied ? "secondary" : "default"}
            onClick={onApplyTemplate}
            disabled={isApplied}
          >
            {isApplied ? "Applied" : "Apply Template"}
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto border rounded-md bg-muted/20 p-4">
        <div className="w-full max-w-[800px] mx-auto">
          <TemplatePreview 
            template={currentTemplate} 
            isEditing={isEditing}
            onElementPositionChange={handleElementPositionChange}
          />
        </div>
      </div>
    </div>
  );
};

export default TemplatePreviewPanel;
