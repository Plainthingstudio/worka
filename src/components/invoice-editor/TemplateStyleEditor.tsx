
import React from "react";
import { InvoiceTemplate, InvoiceTemplateStyle } from "@/types/template";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  Palette, 
  Type, 
  Layout, 
  Table2, 
  Save, 
  Copy, 
  Trash
} from "lucide-react";
import ColorPickerInput from "./ColorPickerInput";

interface TemplateStyleEditorProps {
  template: InvoiceTemplate;
  onUpdateName: (name: string) => void;
  onUpdateDescription: (description: string) => void;
  onUpdateStyle: (style: Partial<InvoiceTemplateStyle>) => void;
  onSaveTemplate: () => void;
  onDuplicateTemplate: () => void;
  onDeleteTemplate: () => void;
}

const TemplateStyleEditor: React.FC<TemplateStyleEditorProps> = ({
  template,
  onUpdateName,
  onUpdateDescription,
  onUpdateStyle,
  onSaveTemplate,
  onDuplicateTemplate,
  onDeleteTemplate
}) => {
  const { style } = template;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Edit Template</h2>
          <p className="text-sm text-muted-foreground">
            Customize your invoice template
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDuplicateTemplate}
            className="gap-1"
            disabled={template.isDefault}
          >
            <Copy className="h-4 w-4" />
            Duplicate
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDeleteTemplate}
            className="gap-1 text-destructive hover:text-destructive"
            disabled={template.isDefault}
          >
            <Trash className="h-4 w-4" />
            Delete
          </Button>
          
          <Button 
            size="sm" 
            onClick={onSaveTemplate}
            className="gap-1"
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>
      
      <div className="mb-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="templateName">Template Name</Label>
            <Input
              id="templateName"
              value={template.name}
              onChange={(e) => onUpdateName(e.target.value)}
              placeholder="Template Name"
              disabled={template.isDefault}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="templateDescription">Description</Label>
            <Input
              id="templateDescription"
              value={template.description}
              onChange={(e) => onUpdateDescription(e.target.value)}
              placeholder="Template Description"
              disabled={template.isDefault}
            />
          </div>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <Tabs defaultValue="colors" className="flex-1">
        <TabsList className="mb-4">
          <TabsTrigger value="colors" className="flex items-center gap-1">
            <Palette className="h-4 w-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-1">
            <Type className="h-4 w-4" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-1">
            <Layout className="h-4 w-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="components" className="flex items-center gap-1">
            <Table2 className="h-4 w-4" />
            Components
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="colors" className="space-y-6">
          <ColorPickerInput
            label="Primary Color"
            value={style.primaryColor}
            onChange={(value) => onUpdateStyle({ primaryColor: value })}
          />
          
          <ColorPickerInput
            label="Secondary Color"
            value={style.secondaryColor}
            onChange={(value) => onUpdateStyle({ secondaryColor: value })}
          />
          
          <ColorPickerInput
            label="Accent Color"
            value={style.accentColor}
            onChange={(value) => onUpdateStyle({ accentColor: value })}
          />
          
          <ColorPickerInput
            label="Border Color"
            value={style.borderColor}
            onChange={(value) => onUpdateStyle({ borderColor: value })}
          />
        </TabsContent>
        
        <TabsContent value="typography" className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="fontFamily">Font Family</Label>
            <Select 
              value={style.fontFamily} 
              onValueChange={(value) => onUpdateStyle({ fontFamily: value })}
            >
              <SelectTrigger id="fontFamily">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="helvetica">Helvetica</SelectItem>
                <SelectItem value="times">Times New Roman</SelectItem>
                <SelectItem value="courier">Courier</SelectItem>
                <SelectItem value="georgia">Georgia</SelectItem>
                <SelectItem value="verdana">Verdana</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
        
        <TabsContent value="layout" className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="logoPosition">Logo Position</Label>
            <Select 
              value={style.logoPosition} 
              onValueChange={(value: 'left' | 'right' | 'center') => 
                onUpdateStyle({ logoPosition: value })
              }
            >
              <SelectTrigger id="logoPosition">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="borderStyle">Border Style</Label>
            <Select 
              value={style.borderStyle} 
              onValueChange={(value: 'none' | 'solid' | 'dashed' | 'dotted') => 
                onUpdateStyle({ borderStyle: value })
              }
            >
              <SelectTrigger id="borderStyle">
                <SelectValue placeholder="Select border style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="borderWidth">Border Width</Label>
            <Input
              id="borderWidth"
              type="number"
              min="0"
              max="10"
              value={style.borderWidth}
              onChange={(e) => onUpdateStyle({ borderWidth: Number(e.target.value) })}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="showLogo"
              checked={style.showLogo}
              onCheckedChange={(checked) => onUpdateStyle({ showLogo: checked })}
            />
            <Label htmlFor="showLogo">Show Logo</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="showSignature"
              checked={style.showSignature}
              onCheckedChange={(checked) => onUpdateStyle({ showSignature: checked })}
            />
            <Label htmlFor="showSignature">Show Signature</Label>
          </div>
        </TabsContent>
        
        <TabsContent value="components" className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="headerStyle">Header Style</Label>
            <Select 
              value={style.headerStyle} 
              onValueChange={(value: 'standard' | 'minimal' | 'detailed') => 
                onUpdateStyle({ headerStyle: value })
              }
            >
              <SelectTrigger id="headerStyle">
                <SelectValue placeholder="Select header style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="footerStyle">Footer Style</Label>
            <Select 
              value={style.footerStyle} 
              onValueChange={(value: 'standard' | 'minimal' | 'detailed') => 
                onUpdateStyle({ footerStyle: value })
              }
            >
              <SelectTrigger id="footerStyle">
                <SelectValue placeholder="Select footer style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="tableStyle">Table Style</Label>
            <Select 
              value={style.tableStyle} 
              onValueChange={(value: 'standard' | 'striped' | 'bordered') => 
                onUpdateStyle({ tableStyle: value })
              }
            >
              <SelectTrigger id="tableStyle">
                <SelectValue placeholder="Select table style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="striped">Striped</SelectItem>
                <SelectItem value="bordered">Bordered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TemplateStyleEditor;
