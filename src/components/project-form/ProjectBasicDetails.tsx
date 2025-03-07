
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Client } from "@/types";
import { ProjectFormValues, projectStatuses } from "./projectFormSchema";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ProjectBasicDetailsProps {
  form: UseFormReturn<ProjectFormValues>;
  clients: Client[];
}

const ProjectBasicDetails = ({ form, clients }: ProjectBasicDetailsProps) => {
  return (
    <>
      <FormField 
        control={form.control} 
        name="name" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project Name</FormLabel>
            <FormControl>
              <Input placeholder="Website Redesign" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />

      <FormField 
        control={form.control} 
        name="clientId" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Client</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} 
      />

      <FormField 
        control={form.control} 
        name="status" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {projectStatuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} 
      />

      <FormField 
        control={form.control} 
        name="deadline" 
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Deadline</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button 
                    variant={"outline"} 
                    className={cn(
                      "w-full pl-3 text-left font-normal", 
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar 
                  mode="single" 
                  selected={field.value} 
                  onSelect={field.onChange} 
                  initialFocus 
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )} 
      />
    </>
  );
};

export default ProjectBasicDetails;
