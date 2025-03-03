import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Client, Currency, Project, ProjectStatus, ProjectType } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters."
  }),
  clientId: z.string({
    required_error: "Please select a client."
  }),
  status: z.enum(["Planning", "In progress", "Completed", "Paused", "Cancelled"], {
    required_error: "Please select a status."
  }),
  deadline: z.date({
    required_error: "Please select a deadline date."
  }),
  fee: z.coerce.number().min(0, {
    message: "Fee cannot be negative."
  }),
  currency: z.enum(["USD", "IDR"], {
    required_error: "Please select a currency."
  }),
  projectType: z.enum(["Project Based", "Monthly Retainer", "Monthly Pay as you go"], {
    required_error: "Please select a project type."
  })
});
interface ProjectFormProps {
  project?: Project;
  clients: Client[];
  onSave: (values: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
}
const ProjectForm = ({
  project,
  clients,
  onSave,
  onCancel
}: ProjectFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name || "",
      clientId: project?.clientId || "",
      status: project?.status || "Planning",
      deadline: project?.deadline ? new Date(project.deadline) : new Date(),
      fee: project?.fee || 0,
      currency: project?.currency || "USD",
      projectType: project?.projectType || "Project Based"
    }
  });
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values);
    toast.success(project ? "Project updated successfully" : "Project created successfully");
  };
  const projectStatuses: ProjectStatus[] = ["Planning", "In progress", "Completed", "Paused", "Cancelled"];
  const currencies: Currency[] = ["USD", "IDR"];
  const projectTypes: ProjectType[] = ["Project Based", "Monthly Retainer", "Monthly Pay as you go"];
  return <>
      

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField control={form.control} name="name" render={({
          field
        }) => <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input placeholder="Website Redesign" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>} />

          <FormField control={form.control} name="clientId" render={({
          field
        }) => <FormItem>
                <FormLabel>Client</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map(client => <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>} />

          <FormField control={form.control} name="status" render={({
          field
        }) => <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projectStatuses.map(status => <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>} />

          <FormField control={form.control} name="deadline" render={({
          field
        }) => <FormItem className="flex flex-col">
                <FormLabel>Deadline</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>} />

          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="fee" render={({
            field
          }) => <FormItem>
                  <FormLabel>Project Fee</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="currency" render={({
            field
          }) => <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencies.map(currency => <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>} />
          </div>

          <FormField control={form.control} name="projectType" render={({
          field
        }) => <FormItem>
                <FormLabel>Project Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projectTypes.map(type => <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>} />

          <DialogFooter className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {project ? "Update Project" : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>;
};
export default ProjectForm;