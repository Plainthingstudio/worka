
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Client, Project, TeamMember } from "@/types";
import { Form } from "@/components/ui/form";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { projectFormSchema, ProjectFormValues } from "./project-form/projectFormSchema";
import ProjectBasicDetails from "./project-form/ProjectBasicDetails";
import ProjectScheduling from "./project-form/ProjectScheduling";
import ProjectFinancialDetails from "./project-form/ProjectFinancialDetails";
import ProjectTeamMembers from "./project-form/ProjectTeamMembers";
import ProjectServices, { type QuantityMap } from "./project-form/ProjectServices";
import { useServices } from "@/hooks/useServices";

interface ProjectFormProps {
  project?: Project;
  clients: Client[];
  teamMembers?: TeamMember[];
  onSave: (values: ProjectFormValues) => void;
  onCancel: () => void;
}

const buildInitialQuantityMap = (ids: string[] = [], quantities: number[] = []): QuantityMap => {
  const map: QuantityMap = {};
  ids.forEach((id, index) => {
    const qty = quantities[index];
    map[id] = typeof qty === "number" && qty > 0 ? qty : 1;
  });
  return map;
};

const ProjectForm = ({
  project,
  clients,
  teamMembers = [],
  onSave,
  onCancel
}: ProjectFormProps) => {
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>(
    project?.teamMembers || []
  );
  const [serviceQuantities, setServiceQuantities] = useState<QuantityMap>(() =>
    buildInitialQuantityMap(project?.serviceIds, project?.serviceQuantities)
  );
  const [subServiceQuantities, setSubServiceQuantities] = useState<QuantityMap>(() =>
    buildInitialQuantityMap(project?.subServiceIds, project?.subServiceQuantities)
  );
  const { services, setupRequired: servicesSetupRequired } = useServices();

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
      serviceIds: project?.serviceIds || [],
      subServiceIds: project?.subServiceIds || [],
      serviceQuantities: project?.serviceQuantities || [],
      subServiceQuantities: project?.subServiceQuantities || [],
      teamMembers: project?.teamMembers || []
    }
  });
  const watchedCurrency = form.watch("currency");

  const selectedServiceEntries = useMemo(
    () =>
      Object.entries(serviceQuantities)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({ id, qty })),
    [serviceQuantities]
  );
  const selectedSubServiceEntries = useMemo(
    () =>
      Object.entries(subServiceQuantities)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({ id, qty })),
    [subServiceQuantities]
  );

  useEffect(() => {
    form.setValue('teamMembers', selectedTeamMembers);
  }, [selectedTeamMembers, form]);

  useEffect(() => {
    form.setValue(
      'serviceIds',
      selectedServiceEntries.map((entry) => entry.id)
    );
    form.setValue(
      'serviceQuantities',
      selectedServiceEntries.map((entry) => entry.qty)
    );
  }, [selectedServiceEntries, form]);

  useEffect(() => {
    form.setValue(
      'subServiceIds',
      selectedSubServiceEntries.map((entry) => entry.id)
    );
    form.setValue(
      'subServiceQuantities',
      selectedSubServiceEntries.map((entry) => entry.qty)
    );
  }, [selectedSubServiceEntries, form]);

  useEffect(() => {
    const currency = watchedCurrency;
    const serviceTotal = services
      .filter((service) => service.currency === currency)
      .reduce((sum, service) => {
        const qty = serviceQuantities[service.id] || 0;
        return sum + service.price * qty;
      }, 0);
    const subServiceTotal = services
      .flatMap((service) => service.subServices || [])
      .filter((subService) => subService.currency === currency)
      .reduce((sum, subService) => {
        const qty = subServiceQuantities[subService.id] || 0;
        return sum + subService.price * qty;
      }, 0);
    const total = serviceTotal + subServiceTotal;

    if (total > 0) {
      form.setValue("fee", total);
    }
  }, [services, serviceQuantities, subServiceQuantities, watchedCurrency, form]);

  useEffect(() => {
    if (services.length === 0) return;

    const currency = watchedCurrency;
    const availableServiceIds = new Set(
      services.filter((service) => service.currency === currency).map((service) => service.id)
    );
    const availableSubServiceIds = new Set(
      services
        .flatMap((service) => service.subServices || [])
        .filter((subService) => subService.currency === currency)
        .map((subService) => subService.id)
    );

    setServiceQuantities((current) => {
      const next: QuantityMap = {};
      Object.entries(current).forEach(([id, qty]) => {
        if (availableServiceIds.has(id) && qty > 0) {
          next[id] = qty;
        }
      });
      return next;
    });
    setSubServiceQuantities((current) => {
      const next: QuantityMap = {};
      Object.entries(current).forEach(([id, qty]) => {
        if (availableSubServiceIds.has(id) && qty > 0) {
          next[id] = qty;
        }
      });
      return next;
    });
  }, [watchedCurrency, services]);

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

        <ProjectServices
          form={form}
          services={services}
          serviceQuantities={serviceQuantities}
          setServiceQuantities={setServiceQuantities}
          subServiceQuantities={subServiceQuantities}
          setSubServiceQuantities={setSubServiceQuantities}
          setupRequired={servicesSetupRequired}
        />

        <ProjectScheduling form={form} />

        <ProjectFinancialDetails
          form={form}
          formatFee={formatFee}
          displayFee={displayFee}
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
