
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { X, Plus } from "lucide-react";
import { ProjectCategory } from "@/types";
import { ProjectFormValues, categoryOptions } from "./projectFormSchema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProjectCategoriesProps {
  form: UseFormReturn<ProjectFormValues>;
  selectedCategories: ProjectCategory[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<ProjectCategory[]>>;
}

const ProjectCategories = ({ 
  form, 
  selectedCategories, 
  setSelectedCategories 
}: ProjectCategoriesProps) => {
  const [categoryInput, setCategoryInput] = useState("");

  const addCategory = (category: ProjectCategory) => {
    if (category.trim() === "") return;
    if (!selectedCategories.includes(category)) {
      setSelectedCategories([...selectedCategories, category]);
    }
    setCategoryInput("");
  };

  const removeCategory = (category: ProjectCategory) => {
    setSelectedCategories(selectedCategories.filter(c => c !== category));
  };

  return (
    <FormField 
      control={form.control} 
      name="categories" 
      render={() => (
        <FormItem>
          <FormLabel>Project Categories</FormLabel>
          <div className="flex flex-col space-y-3">
            <div className="flex">
              <FormControl>
                <Input 
                  placeholder="Add a category..." 
                  value={categoryInput}
                  onChange={e => setCategoryInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCategory(categoryInput);
                    }
                  }}
                />
              </FormControl>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={() => addCategory(categoryInput)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pb-2">
              {selectedCategories.map(category => (
                <Badge key={category} variant="outline" className="flex items-center gap-1">
                  {category}
                  <button 
                    type="button" 
                    onClick={() => removeCategory(category)}
                    className="rounded-full text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {category}</span>
                  </button>
                </Badge>
              ))}
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium mb-2">Suggested categories:</p>
              <div className="flex flex-wrap gap-1">
                {categoryOptions
                  .filter(cat => !selectedCategories.includes(cat))
                  .map(category => (
                    <Badge 
                      key={category} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => addCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))
                }
              </div>
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )} 
    />
  );
};

export default ProjectCategories;
