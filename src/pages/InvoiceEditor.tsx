
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid2X2, Table, Rows } from 'lucide-react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { InvoiceTemplatesProvider, useInvoiceTemplates, defaultTemplate } from '@/hooks/useInvoiceTemplates';
import { InvoiceTemplate } from '@/types/template';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { useSidebarState } from '@/hooks/useSidebarState';
import TemplatesList from '@/components/invoice-editor/TemplatesList';
import TemplateStyleEditor from '@/components/invoice-editor/TemplateStyleEditor';
import TemplatePreviewPanel from '@/components/invoice-editor/TemplatePreviewPanel';

// Wrapper component to use hooks
const InvoiceEditorContent = () => {
  const navigate = useNavigate();
  const { isSidebarExpanded } = useSidebarState();
  const { 
    templates, 
    activeTemplate,
    setActiveTemplate,
    saveTemplate,
    deleteTemplate,
    duplicateTemplate,
    updateTemplateName,
    updateTemplateStyle
  } = useInvoiceTemplates();
  
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Check if the active template is applied as the default
  const isTemplateApplied = activeTemplate.isDefault;

  // Handle creating a new template
  const handleCreateTemplate = () => {
    const newTemplate = saveTemplate({
      name: `Template ${templates.length + 1}`,
      description: 'New custom template',
      style: { ...defaultTemplate.style }
    });
    
    setActiveTemplate(newTemplate);
  };

  // Apply the current template as the default
  const handleApplyTemplate = () => {
    // Update all templates to set isDefault to false
    const updatedTemplates = templates.map(template => {
      if (template.id === activeTemplate.id) {
        return { ...template, isDefault: true };
      }
      return { ...template, isDefault: false };
    });
    
    // Save each template
    updatedTemplates.forEach(template => {
      saveTemplate(template);
    });
    
    // Update the active template
    setActiveTemplate({ ...activeTemplate, isDefault: true });
  };

  // Handle template name update
  const handleUpdateName = (name: string) => {
    updateTemplateName(activeTemplate.id, name);
  };

  // Handle template description update
  const handleUpdateDescription = (description: string) => {
    saveTemplate({ ...activeTemplate, description });
  };

  return (
    <div className="flex h-screen bg-muted/10">
      <Sidebar />
      <div 
        className={`flex-1 w-full transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? "ml-56" : "ml-14"
        }`}
      >
        <Navbar title="Invoice Editor" />
        <main className="p-6 h-[calc(100vh-56px)]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Invoice Templates</h1>
              <p className="text-muted-foreground">
                Create and manage your invoice templates
              </p>
            </div>
            
            <div className="flex gap-2">
              <div className="border rounded-md p-0.5 flex">
                <Button 
                  size="sm" 
                  variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                  className="h-8"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid2X2 className="h-4 w-4" />
                  <span className="sr-only">Grid View</span>
                </Button>
                <Button 
                  size="sm" 
                  variant={viewMode === 'list' ? 'default' : 'ghost'} 
                  className="h-8"
                  onClick={() => setViewMode('list')}
                >
                  <Rows className="h-4 w-4" />
                  <span className="sr-only">List View</span>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card h-[calc(100vh-170px)]">
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                <ScrollArea className="h-full">
                  <div className="p-4 h-full">
                    <TemplatesList 
                      templates={templates}
                      activeTemplate={activeTemplate}
                      onSelectTemplate={setActiveTemplate}
                      onCreateTemplate={handleCreateTemplate}
                    />
                  </div>
                </ScrollArea>
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              <ResizablePanel defaultSize={75}>
                <Tabs defaultValue="edit" className="h-full">
                  <div className="border-b px-4 py-2">
                    <TabsList>
                      <TabsTrigger 
                        value="edit" 
                        onClick={() => setIsEditorOpen(true)}
                        className="flex items-center gap-1"
                      >
                        <Table className="h-4 w-4" />
                        Edit
                      </TabsTrigger>
                      <TabsTrigger 
                        value="preview" 
                        onClick={() => setIsEditorOpen(false)}
                        className="flex items-center gap-1"
                      >
                        <Table className="h-4 w-4" />
                        Preview
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="edit" className="h-[calc(100%-53px)]">
                    <div className="p-4 h-full">
                      <TemplateStyleEditor 
                        template={activeTemplate}
                        onUpdateName={handleUpdateName}
                        onUpdateDescription={handleUpdateDescription}
                        onUpdateStyle={(style) => updateTemplateStyle(activeTemplate.id, style)}
                        onSaveTemplate={() => saveTemplate(activeTemplate)}
                        onDuplicateTemplate={() => duplicateTemplate(activeTemplate.id)}
                        onDeleteTemplate={() => deleteTemplate(activeTemplate.id)}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="preview" className="h-[calc(100%-53px)]">
                    <div className="p-4 h-full">
                      <TemplatePreviewPanel 
                        template={activeTemplate}
                        isApplied={isTemplateApplied}
                        onApplyTemplate={handleApplyTemplate}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </main>
      </div>
    </div>
  );
};

// Provider wrapper
const InvoiceEditor = () => {
  return (
    <InvoiceTemplatesProvider>
      <InvoiceEditorContent />
    </InvoiceTemplatesProvider>
  );
};

export default InvoiceEditor;
