
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash, Copy, Save } from "lucide-react";
import { InvoiceTemplate, InvoiceTemplateStyle } from '@/types/template';
import ColorPickerInput from './ColorPickerInput';

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
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description || "");

  // Update name field when template changes
  React.useEffect(() => {
    setName(template.name);
    setDescription(template.description || "");
  }, [template]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleSaveName = () => {
    onUpdateName(name);
  };

  const handleSaveDescription = () => {
    onUpdateDescription(description);
  };

  const handleStyleChange = (key: keyof InvoiceTemplateStyle, value: any) => {
    onUpdateStyle({ [key]: value });
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4 items-end">
          <div className="col-span-3">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={name}
              onChange={handleNameChange}
              onBlur={handleSaveName}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={onDuplicateTemplate}
              title="Duplicate Template"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="icon"
              onClick={onDeleteTemplate}
              title="Delete Template"
              disabled={template.id === 'default'}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="template-description">Description</Label>
          <Textarea
            id="template-description"
            value={description}
            onChange={handleDescriptionChange}
            onBlur={handleSaveDescription}
            className="mt-1 resize-none"
            rows={2}
          />
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="colors" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="elements">Elements</TabsTrigger>
        </TabsList>
        <div className="flex-1 overflow-auto pt-4">
          <TabsContent value="colors" className="space-y-4">
            <div>
              <Label>Primary Color</Label>
              <ColorPickerInput
                color={template.style.primaryColor}
                onChange={(color) => handleStyleChange('primaryColor', color)}
              />
            </div>
            <div>
              <Label>Secondary Color</Label>
              <ColorPickerInput
                color={template.style.secondaryColor}
                onChange={(color) => handleStyleChange('secondaryColor', color)}
              />
            </div>
            <div>
              <Label>Accent Color</Label>
              <ColorPickerInput
                color={template.style.accentColor}
                onChange={(color) => handleStyleChange('accentColor', color)}
              />
            </div>
            <div>
              <Label>Border Color</Label>
              <ColorPickerInput
                color={template.style.borderColor}
                onChange={(color) => handleStyleChange('borderColor', color)}
              />
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-4">
            <div>
              <Label htmlFor="font-family">Font Family</Label>
              <Select
                value={template.style.fontFamily}
                onValueChange={(value) => handleStyleChange('fontFamily', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="helvetica">Helvetica</SelectItem>
                  <SelectItem value="arial">Arial</SelectItem>
                  <SelectItem value="georgia">Georgia</SelectItem>
                  <SelectItem value="times-new-roman">Times New Roman</SelectItem>
                  <SelectItem value="courier-new">Courier New</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="logo-position">Logo Position</Label>
                <Select
                  value={template.style.logoPosition}
                  onValueChange={(value: 'left' | 'center' | 'right') => handleStyleChange('logoPosition', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-logo">Show Logo</Label>
                <Switch
                  id="show-logo"
                  checked={template.style.showLogo}
                  onCheckedChange={(checked) => handleStyleChange('showLogo', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-signature">Show Signature</Label>
                <Switch
                  id="show-signature"
                  checked={template.style.showSignature}
                  onCheckedChange={(checked) => handleStyleChange('showSignature', checked)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Borders</h3>
              <div>
                <Label htmlFor="border-style">Border Style</Label>
                <Select
                  value={template.style.borderStyle}
                  onValueChange={(value: 'none' | 'solid' | 'dashed' | 'dotted') => handleStyleChange('borderStyle', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="dashed">Dashed</SelectItem>
                    <SelectItem value="dotted">Dotted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="border-width">Border Width</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    id="border-width"
                    type="number"
                    min="0"
                    max="5"
                    value={template.style.borderWidth}
                    onChange={(e) => handleStyleChange('borderWidth', parseInt(e.target.value))}
                  />
                  <span>px</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Component Styles</h3>
              <div>
                <Label htmlFor="header-style">Header Style</Label>
                <Select
                  value={template.style.headerStyle}
                  onValueChange={(value: 'standard' | 'minimal' | 'modern') => handleStyleChange('headerStyle', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="table-style">Table Style</Label>
                <Select
                  value={template.style.tableStyle}
                  onValueChange={(value: 'standard' | 'striped' | 'bordered') => handleStyleChange('tableStyle', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="striped">Striped</SelectItem>
                    <SelectItem value="bordered">Bordered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="footer-style">Footer Style</Label>
                <Select
                  value={template.style.footerStyle}
                  onValueChange={(value: 'standard' | 'minimal' | 'modern') => handleStyleChange('footerStyle', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="elements" className="space-y-4">
            <div className="p-4 bg-muted/20 rounded-md text-center">
              <p className="text-sm text-muted-foreground">
                In the Preview tab, you can drag and drop invoice elements to reposition them.
              </p>
              <p className="text-sm font-medium mt-2">
                Click "Edit Layout" to start arranging elements.
              </p>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Element Positions</h3>
              <div className="space-y-2 text-sm">
                <p>Header: {JSON.stringify(template.style.elements?.header || { x: 40, y: 40 })}</p>
                <p>Client Info: {JSON.stringify(template.style.elements?.clientInfo || { x: 40, y: 120 })}</p>
                <p>Dates: {JSON.stringify(template.style.elements?.dates || { x: 400, y: 120 })}</p>
                <p>Items: {JSON.stringify(template.style.elements?.items || { x: 40, y: 220 })}</p>
                <p>Totals: {JSON.stringify(template.style.elements?.totals || { x: 400, y: 400 })}</p>
                <p>Notes: {JSON.stringify(template.style.elements?.notes || { x: 40, y: 450 })}</p>
                <p>Signature: {JSON.stringify(template.style.elements?.signature || { x: 400, y: 500 })}</p>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={onSaveTemplate}
          className="px-4"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Template
        </Button>
      </div>
    </div>
  );
};

export default TemplateStyleEditor;
