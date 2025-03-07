
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Client, Project, ProjectCategory, TeamMember } from "@/types";
import { Form } from "@/components/ui/form";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { projectFormSchema, ProjectFormValues } from "./project-form/projectFormSchema";
import ProjectBasicDetails from "./project-form/ProjectBasicDetails";
import ProjectFinancialDetails from "./project-form/ProjectFinancialDetails";
import ProjectCategories from "./project-form/ProjectCategories";
import ProjectTeamMembers from "./project-form/ProjectTeamMembers";

interface ProjectFormProps {
  project?: Project;
  clients: Client[];
  teamMembers?: TeamMember[];
  onSave: (values: ProjectFormValues) => void;
  onCancel: () => void;
}

const ProjectForm = ({
  project,
  clients,
  teamMembers = [],
  onSave,
  onCancel
}: ProjectFormProps) => {
  const [selectedCategories, setSelectedCategories] = useState<ProjectCategory[]>(
    project?.categories || []
  );
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>(
    project?.teamMembers || []
  );

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project?.name || "",
      clientId: project?.clientId || "",
      status: project?.status || "Planning",
      deadline: project?.deadline ? new Date(project.deadline) : new Date(),
      fee: project?.fee || 0,
      currency: project?.currency || "USD",
      projectType: project?.projectType || "Project Based",
      categories: project?.categories || [],
      teamMembers: project?.teamMembers || []
    }
  });

  useEffect(() => {
    form.setValue('categories', selectedCategories);
    form.setValue('teamMembers', selectedTeamMembers);
  }, [selectedCategories, selectedTeamMembers, form]);

  useEffect(() => {
    const feeValue = form.getValues('fee');
    const formattedFee = feeValue;
    if (feeValue !== undefined) {
      form.setValue('fee', formattedFee);
    }
  }, [form]);

  const handleSubmit = (values: ProjectFormValues) => {
    onSave(values);
    toast.success(project ? "Project updated successfully" : "Project created successfully");
  };

  const formatFee = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(numericValue);
    if (isNaN(parsed)) {
      return '';
    }
    return numericValue;
  };

  const displayFee = (fee: number) => {
    return fee.toLocaleString();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <ProjectBasicDetails 
          form={form} 
          clients={clients} 
        />

        <ProjectFinancialDetails 
          form={form} 
          formatFee={formatFee} 
          displayFee={displayFee} 
        />

        <ProjectCategories 
          form={form} 
          selectedCategories={selectedCategories} 
          setSelectedCategories={setSelectedCategories} 
        />

        {teamMembers.length > 0 && (
          <ProjectTeamMembers 
            form={form} 
            teamMembers={teamMembers} 
            selectedTeamMembers={selectedTeamMembers} 
            setSelectedTeamMembers={setSelectedTeamMembers} 
          />
        )}

        <DialogFooter className="sticky bottom-0 pt-4 mt-6 bg-background">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {project ? "Update Project" : "Create Project"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default ProjectForm;
