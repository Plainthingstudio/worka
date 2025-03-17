
import React from "react";
import { InvoiceTemplate } from "@/types/template";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

interface TemplatePreviewProps {
  template: InvoiceTemplate;
  isActive: boolean;
  onClick: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  isActive,
  onClick
}) => {
  const { style } = template;
  
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 overflow-hidden ${
        isActive 
          ? 'ring-2 ring-primary ring-offset-2' 
          : 'hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <div 
        className="h-2" 
        style={{ backgroundColor: style.primaryColor }}
      />
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-sm">{template.name}</h3>
            <p className="text-xs text-muted-foreground truncate max-w-[160px]">
              {template.description}
            </p>
          </div>
          
          {isActive && (
            <div className="bg-primary text-primary-foreground rounded-full p-1">
              <Check className="h-3 w-3" />
            </div>
          )}
        </div>
        
        <div className="mt-4 border rounded-sm overflow-hidden" style={{ borderColor: style.borderColor }}>
          <div 
            className="text-xs p-2 flex justify-between items-center" 
            style={{ backgroundColor: style.primaryColor, color: '#fff' }}
          >
            <div>INVOICE</div>
            <div>#INV-001</div>
          </div>
          
          <div className="text-[0.6rem] p-1">
            <div className="mb-1 bg-muted/40 h-1.5 w-20 rounded-full"></div>
            <div className="mb-1 bg-muted/40 h-1.5 w-16 rounded-full"></div>
          </div>
          
          <div 
            className="text-[0.6rem] p-1 border-t border-b" 
            style={{ borderColor: style.borderColor }}
          >
            <div className="flex justify-between">
              <span>Item</span>
              <span>Total</span>
            </div>
            <div className="h-2"></div>
            <div className="flex justify-between">
              <span>⎯⎯⎯⎯</span>
              <span>$00.00</span>
            </div>
          </div>
          
          <div 
            className="text-[0.6rem] p-1 flex justify-between"
            style={{ backgroundColor: style.accentColor, color: '#fff' }}
          >
            <span>TOTAL</span>
            <span>$00.00</span>
          </div>
        </div>
        
        {template.isDefault && (
          <div className="mt-2 text-xs text-muted-foreground italic">Default template</div>
        )}
      </CardContent>
    </Card>
  );
};

export default TemplatePreview;
